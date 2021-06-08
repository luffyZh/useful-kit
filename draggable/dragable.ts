/**
 * 为了确保兼容性，建议使用 requestAnimationFrame 的 polyfill 版本 raf
 * 如果是ES6，可以使用 import/export 进行导入导出
 */
// import raf from 'raf';

const raf = window.requestAnimationFrame;

const isAndroid = / Android /.test(navigator.userAgent);

/**
 * 封装拖拽函数
 * @param $ele 需要拖拽的元素
 * @param adsorb { x = 20, y = 80 } 上下左右吸附的边距
 */
function draggable($ele, adsorb = { x: 20, y: 80 }) {
  if (!$ele) {
    throw new Error("必须是可拖拽元素");
  }
  // 开始时候的位置
  let startX = 0;
  let startY = 0;

  // 移动过程中的 left 和 top，其实通过这俩参数，就能确定元素位置
  let left = 0;
  let top = 0;

  // 屏幕的宽高
  const cw = document.documentElement.clientWidth;
  const ch = document.documentElement.clientHeight;

  // 获取到元素自身的宽高
  const { width, height } = $ele.getBoundingClientRect();

  /**
   * 开始拖拽的事件
   */
  $ele.addEventListener(
    "touchstart",
    function (event) {
      startX = event.targetTouches[0].pageX;
      startY = event.targetTouches[0].pageY;

      top = $ele.offsetTop;
      left = $ele.offsetLeft;

      event.preventDefault();
    },
    false
  );

  /**
   * 拖拽过程中的事件
   */
  $ele.addEventListener(
    "touchmove",
    function (event) {
      // 偏移距离
      const offsetX = event.targetTouches[0].pageX - startX;
      const offsetY = event.targetTouches[0].pageY - startY;

      $ele.style.top = `${top + offsetY}px`;
      $ele.style.left = `${left + offsetX}px`;
      $ele.style.right = "auto";
      $ele.style.bottom = "auto";

      event.preventDefault();
    },
    false
  );

  function touchDone(event) {
    const dx = event.changedTouches[0].pageX - startX;
    const dy = event.changedTouches[0].pageY - startY;

    const ty = top + dy;
    const tx = left + dx;

    $ele.style.top = `${ty}px`;
    $ele.style.left = `${tx}px`;
    $ele.style.right = "auto";
    $ele.style.bottom = "auto";

    const adsorb_safe_x = cw - width - adsorb.x;
    const adsorb_safe_y = ch - height - adsorb.y;

    raf(() => {
      let nx;
      let ny = ty;

      if (tx + width / 2 < cw / 2) {
        nx = adsorb.x;
      } else {
        nx = adsorb_safe_x;
      }

      if (ty < adsorb.y) {
        ny = adsorb.y;
      } else if (ty > adsorb_safe_y) {
        ny = adsorb_safe_y;
      }

      // 无需移动，并且认为进行了一次点击
      if (Math.abs(tx - nx) < 5 && Math.abs(ty - ny) < 5) {
        $ele.click();
        return;
      }

      const MOVE_ANIM_INTER = isAndroid
        ? Math.abs(((250 * (tx - nx)) / 800) | 0)
        : 200;

      $ele.style.webkitTransition = `left ${MOVE_ANIM_INTER}ms ease-in-out, top ${MOVE_ANIM_INTER}ms ease-in-out`;
      $ele.style.transition = `left ${MOVE_ANIM_INTER}ms ease-in-out, top ${MOVE_ANIM_INTER}ms ease-in-out`;

      const onAnimationDone = () => {
        $ele.style.webkitTransition = $ele.style.transition = "none";

        $ele.removeEventListener("webkitTransitionEnd", onAnimationDone, false);
        $ele.removeEventListener("transitionend", onAnimationDone, false);
      };

      $ele.addEventListener("webkitTransitionEnd", onAnimationDone, false);
      $ele.addEventListener("transitionend", onAnimationDone, false);

      $ele.style.top = `${ny}px`;
      $ele.style.left = `${nx}px`;
    });
  }

  $ele.addEventListener("touchend", touchDone, true);
  $ele.addEventListener("touchcancel", touchDone, true);
}
