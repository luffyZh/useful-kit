/**
 * 时间格式化 
 * @param num 时间
 * @param fmt 格式，可以只有 hh ｜ mm ｜ ss
 */
function timeFormat (num, fmt = 'hh:mm:ss'): number | string {
  const hours = Math.floor(num / 1000 / 60 / 60);
  const minutes = Math.floor(num / 1000 / 60 - 60 * hours);
  const seconds = Math.floor(num / 1000 - 60 * 60 * hours - 60 * minutes);
  const o = {
      'h+': hours,
      'm+': minutes,
      's+': seconds,
  };
  for (const k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
      }
  }
  return fmt;
}