/**
 * 防抖函数
 * @param fn 
 * @param delay 
 * @param immediate 
 */
function debounce(fn: Function, delay: number, immediate: boolean = false) {
  let timer = null;
  return function() {
    const _context = this;
    const _args = arguments;
    timer && clearTimeout(timer);
    // 正常的防抖，最后一次结束执行
    if (!immediate) {
      timer = setTimeout(function() {
        fn.apply(_context, _args);
      }, delay);
      return;
    }
    // 立即执行的防抖
    // 如果 timer 没有值，表示还没执行过
    const canImmediate = !timer;
    timer = setTimeout(function() {
      timer = null;
    }, delay);
    canImmediate && fn.apply(_context, _args);
  }
}