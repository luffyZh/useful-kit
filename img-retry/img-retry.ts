const CDN_ARRS = ['ali-cdn', 'tx-cdn', 'js-cdn'];
const DEFAULT_IMG = '/static/images/default-head-image.png';

const imgSrc = '';

function log(type, options) { console.log('进行日志上报'); }

/**
 * 失败重新请求其他cdn，只请求一次，也就是重试一轮，如果都不行就使用默认的兜底图片
 * @param src 图片链接
 */
function ImageCDN(src) {
  // 初始化的时候使用默认的图片进行兜底
  if (!src) {
    this.imgSrc = DEFAULT_IMG;
  }
  const img = new Image();
  img.src = src;
  img.onload = () => {
    // 如果图片加载成功了，进行替换
    this.imgSrc = src;
  }
  img.onerror = () => {
    log('IMAGE_CDN_ERROR', {
      src,
    });
    const matchImage = src.match(`(${CDN_ARRS.join('|')})`);
    if (matchImage) {
      // 表示此CDN已经加载失败，换另外的两个CDN
      CDN_ARRS.splice(CDN_ARRS.indexOf(matchImage[0]), 1);
      // 通过 race 去请求，哪个先回来就加载哪个
      Promise.race(
          CDN_ARRS.map((cdn) => {
              return new Promise((resolve) => {
                  const img = new Image();
                  const targetSrc = this.src.replace(matchImage[0], cdn);
                  img.src = targetSrc;
                  img.onload = () => {
                      resolve(targetSrc);
                  };
                  img.onerror = () => {
                      log('IMAGE_CDN_ERROR', {
                          src: targetSrc
                      });
                  };
              });
          })
      ).then((value: any) => {
          this.imgSrc = value;
          log('IMAGE_CDN_RETRY_SUCCESS', {
              src: value,
          });
      });
    }
  }
}