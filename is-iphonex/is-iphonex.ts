// Web版本
function isSkeletonIphoneX() {
  // iPhone X、iPhone XS
  const isIPhoneX = /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 3 && window.screen.width === 375 && window.screen.height === 812;
  // iPhone XS Max iphone11 Pro
  const isIPhoneXSMax = /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 3 && window.screen.width === 414 && window.screen.height === 896;
  // iPhone XR iphone11
  const isIPhoneXR = /iphone/gi.test(window.navigator.userAgent) && window.devicePixelRatio && window.devicePixelRatio === 2 && window.screen.width === 414 && window.screen.height === 896;
  if (isIPhoneX || isIPhoneXSMax || isIPhoneXR) return true;
  return false;
}

// 小程序版
export function isIphoneX() {
  // iphoneX 及以上的异形屏top为 44，非异形屏为 20
  return wx.getSystemInfoSync().safeArea && wx.getSystemInfoSync().safeArea.top > 20;
}