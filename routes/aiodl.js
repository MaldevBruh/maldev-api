import axios from 'axios';
import * as cheerio from 'cheerio';

export default async function route(fastify) {
  fastify.route({
    method: 'GET',
    url: '/api/downloader/aiodl',
    schema: {
      description: 'Social Media Video Downloader (X, Twitter, Instagram, Facebook, TikTok, LinkedIn)',
      tags: ['Downloader'],
      querystring: {
        type: 'object',
        properties: {
          url: { type: 'string', default: 'https://www.instagram.com/reel/DI6xTtfzJfA/?igsh=aHAydWFzd3MwbnZ2' },
        },
        required: ['url'],
      },
      response: {
        200: {
          description: 'OK',
          type: 'object',
          properties: {
            ok: { type: 'boolean' },
            result: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  default: 'Santai, tenang, dan terkendali brok😹☕\n. \n. \n. \n. \n. \n. \n. \n. \n. \n#meme #uinsa #surabaya #fypppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppppp #shitpost #santai'
                },
                author: {
                  type: 'string',
                  default: '@memeuinsa.sby_'
                },
                views: {
                  type: 'string',
                  default: '375.6K'
                },
                likes: {
                  type: 'string',
                  default: '123.3K'
                },
                uploadDate: {
                  type: 'string',
                  default: 'Saturday, 26 April 2025 17:36'
                },
                duration: {
                  type: 'string',
                  default: '15 seconds'
                },
                videoUrl: {
                  type: 'string',
                  default: 'https://scontent-fra3-1.cdninstagram.com/o1/v/t16/f2/m86/AQOxoRjp53HfeEfHPp9efB6jxLNoEpaosnqubeznIt8Kurr9hD4Bhf1NqUEs9h840g3_iH8G_u7cpS50_Y8CezNn0lESY-0Ndl0aCQk.mp4?stp=dst-mp4&efg=eyJxZV9ncm91cHMiOiJbXCJpZ193ZWJfZGVsaXZlcnlfdnRzX290ZlwiXSIsInZlbmNvZGVfdGFnIjoidnRzX3ZvZF91cmxnZW4uY2xpcHMuYzIuNzIwLmJhc2VsaW5lIn0&_nc_cat=108&vs=3959051397744608_2879886934&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC8zRjRGRDM5RDlGNDc5NjFFNjA2RjE4NjhBODlGMTM5OF92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYOnBhc3N0aHJvdWdoX2V2ZXJzdG9yZS9HRGNpU1IxcHN4TGpMWTRGQUY4aHJ2UXpJamtXYnFfRUFBQUYVAgLIARIAKAAYABsAFQAAJo7HnpOK8pdAFQIoAkMzLBdALjMzMzMzMxgSZGFzaF9iYXNlbGluZV8xX3YxEQB1%2Fgdl5p0BAA%3D%3D&_nc_rid=3ac51b18db&ccb=9-4&oh=00_AfM_zIjMxkvcZCNObd7lH1CLQ8W0taKTUpyi_-7j6DtSiw&oe=6845FD54&_nc_sid=d885a2'
                }
              }
            }
          }
        }
      }
    },
    handler: async (request, reply) => {
      const { url } = request.query;
      if(!url) return reply.code(400).send({
        ok: false,
        message: 'Please input parameter "url"'
      });
      const data = await squidlr(url);
      if(!data.ok) return reply.code(500).send(data);
      return reply.code(200).send(data);
    },
  });
}

async function squidlr(url) {
  try {
    const { data } = await axios.get(`https://www.squidlr.com/download?url=${encodeURIComponent(url)}`);
    const $ = cheerio.load(data);
    const title = $('p.content-text').text().trim();
    const author = $('footer.blockquote-footer').text().trim().split('\n')[0];
    let views,
      likes;
    $('li.list-inline-item').each((_, e) => {
      const small = $(e).find('small').text().trim();
      const value = $(e).find('strong').text().trim();
      if(small === 'Views') views = value;
      if(small === 'Likes') likes = value;
    });
    const uploadDate = $('time').text().trim();
    const duration = $('.card-text li.list-inline-item').eq(0).text().trim();
    const videoUrl = $('.list-group a').attr('href');
    return {
      ok: true,
      result: {
        title: title || 'Unknown',
        author: author || 'Unknown',
        views: views || 'Unknown',
        likes: likes || 'Unknown',
        uploadDate: uploadDate || 'Unknown',
        duration: duration || 'Unknown',
        videoUrl: videoUrl || 'Unknown'
      }
    }
  } catch (e) {
    return {
      ok: false,
      message: e.response?.data?.error || e.response?.data || e.message || e
    }
  }
}
