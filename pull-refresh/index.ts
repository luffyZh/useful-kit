interface IPullRefreshConfig {
  $_ele?: HTMLElement;
  refreshListener?: () => void;
  refreshStyleConfig?: Record<string, string>;
}

enum EPullDirection {
  'unkonw' = 0,
  'down' = 1,
  'up' = 2
}

function __default_refresh_listener() {
  location.reload();
}

const __default_refresh_style_config = {
  color: '#000',
  fontSize: '12px',
  backgroundColor: 'rgba(255, 255, 255, 1)', // 刷新容器的背景色
}

export default class PullRefresh {
  constructor(config: IPullRefreshConfig = {}) {
    this.$_ele = config.$_ele || document.body;
    this.refreshListener = config.refreshListener || __default_refresh_listener;
    this.refreshStyleConfig = config.refreshStyleConfig || __default_refresh_style_config;
    // 初始化，就可以更新了
    this.init();
  }
  // 下拉刷新的那个容器
  $_ele: HTMLElement;

  // 刷新函数
  refreshListener: () => void;

  // 下拉刷新过程中的位置函数
  position =  {
    start_x: 0, // 开始触碰的位置 x
    start_y: 0, // 开始触碰的位置 y
    end_x: 0, // 结束的位置 x
    end_y: 0, // 结束的位置 y
    direction: EPullDirection.unkonw, // 手指移动的方向
    scroll_on_top: true, // 滚动条是否在最顶部，在最顶部才能下拉刷新
  }

  // 是否在 loading 中，初始化 false
  loading: boolean = false;

  // 刷新过程中的容器
  refreshContainer: HTMLElement | null = null;

  // 下拉过程中的 timer
  timer: any;

  // 刷新的样式配置
  refreshStyleConfig: any = __default_refresh_style_config;

  setEnabled(flag: boolean) {
    (window as any)._setPullRefreshEnabled(flag);
  }

  setRefreshListener(fn: any) {
    this.refreshListener = fn;
  }

  setLoading(flag: boolean) {
    this.loading = flag;
  }

  setRefreshContainer(dom: HTMLElement) {
    this.refreshContainer = dom;
  }

  checkScrollIsOnTop() {
    const top = document.documentElement.scrollTop || document.body.scrollTop;
    return top <= 0;
  }

  // 初始化 touchstart 事件
  initTouchStart() {
    const _self = this;
    _self.$_ele.addEventListener('touchstart', function(e) {
      // 如果下拉刷新被禁用，那么直接返回
      if (!(window as any).__pull_refresh_enabled) return;
      Object.assign(_self.position, {
        scroll_on_top: _self.checkScrollIsOnTop(),
        start_x: e.touches[0].pageX,
        start_y: e.touches[0].pageY,
      });
    });
  }

  // 初始化 touchmove 事件
  initTouchMove() {
    const _self = this;
    _self.$_ele.addEventListener('touchmove', function(e) {
      // 禁用刷新
      if (!(window as any).__pull_refresh_enabled) return;
      // 存储移动过程中的偏移
      const { start_x, start_y, scroll_on_top } = _self.position;
      const offsetY = e.touches[0].pageY - start_y;
      const offsetX = e.touches[0].pageX - start_x;
      // 方向向下才是刷新
      if (offsetY > 150 && offsetY > Math.abs(offsetX)) {
        _self.position.direction = EPullDirection.down
      } else if (offsetY < 0 && Math.abs(offsetY) > Math.abs(offsetX)) {
        _self.position.direction = EPullDirection.up
      } else {
        _self.position.direction = EPullDirection.unkonw
      }
      if (
        _self.loading || // 如果在 loading 过程中，直接返回
        !scroll_on_top || // 如果不是在最顶部下拉的，直接返回
        _self.position.direction !== EPullDirection.down // 方向不是向下，直接返回
      ) return;
      console.log('达到了下拉阈值: ', offsetY);
      _self.setLoading(true);
      Object.assign(_self.$_ele.style, {
        transform: 'translate3d(0, 100px, 0)',
        transition: 'all ease .5s',
      });
      (_self.refreshContainer as HTMLElement).innerHTML = "下拉刷新内容...";
    });
  }

  // 初始化 touchmove 事件
  initTouchEnd() {
    const _self = this;
    _self.$_ele.addEventListener('touchend', function() {
      // 禁用刷新
      if (!(window as any).__pull_refresh_enabled) return;
      const { scroll_on_top, direction } = _self.position;
      // 没在顶部或者没有触发 loading，end 不做任何操作
      if (!scroll_on_top || direction !== EPullDirection.down || !_self.loading) return;
      (_self.refreshContainer as HTMLElement).innerHTML = '<div class="refresh-icon"></div>';
      _self.timer = setTimeout(function() {
        if (_self.timer) clearTimeout(_self.timer);
        (_self.refreshContainer as HTMLElement).innerHTML = '';
        Object.assign(_self.$_ele.style, {
          transform: 'translate3d(0, 0, 0)',
          transition: 'all cubic-bezier(.21,1.93,.53,.64) 0.5s'
        });
        _self.setLoading(false);
        _self.position.direction = EPullDirection.unkonw;
        setTimeout(() => {
          // 开始刷新
          _self.refreshListener();
          setTimeout(() => {
            // 特殊处理，要不然会使得 dom 里的 fixed 布局会失效
            Object.assign(_self.$_ele.style, {
              transform: '',
              transition: ''
            });
          }, 500)
        });
      }, 1000);
    })
  }

  /**
   * 初始化下拉刷新的样式
   */
  initRefreshStyle(cssStr: string = '') {
    if (document.getElementById('pull_refresh__style') && cssStr.length > 0) {
      (document.getElementById('pull_refresh__style') as HTMLElement).innerHTML = cssStr;
      return;
    }
    const styleDom = document.createElement('style');
    styleDom.id = 'pull_refresh__style';
    styleDom.innerHTML = `
      .pull_refresh__container {
        position: absolute;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100px;
        line-height: 100px;
        color: ${this.refreshStyleConfig.color};
        font-size: ${this.refreshStyleConfig.fontSize};
        text-align: center;
        left: 0;
        top: 0;
        background-color: ${this.refreshStyleConfig.backgroundColor};
        transform: translate3d(0, -100px, 0);
      }
      div.refresh-icon {
        border: 2px solid rgba(126, 126, 126, 0.2);
        border-top-color: #fff;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to {
        transform: rotate(360deg);
        }
      }
    `;
    document.head.appendChild(styleDom);
  }

  /**
   * 这里特别对普通的 H5 和常用的 SPA 单页应用做了处理
   * 普通 H5 可以直接使用 body 作为下拉刷新容器
   * SPA 可以使用 #app 作为下拉刷新容器
   */
  initRefreshContainer() {
    const refreshDom = document.createElement('div');
    refreshDom.classList.add('pull_refresh__container');
    // 如果不存在第一个元素，那么直接往里面插入
    if (!this.$_ele.firstElementChild) {
      this.$_ele.appendChild(refreshDom);
      return;
    }
    // 存在第一个元素，往第一个元素之前插入
    this.$_ele.insertBefore(refreshDom, this.$_ele.firstElementChild);
    // 初始化下拉刷新容器
    setTimeout(() => {
      this.setRefreshContainer(refreshDom);
    }, 0);
  }

  init() {
    (window as any)._setPullRefreshEnabled = function(flag: boolean) { 
      (window as any).__pull_refresh_enabled = flag;
    }
    this.setEnabled(true);
    // 初始化处理页面样式和结构，new Class 的过程中就可以完成
    this.initRefreshStyle();
    this.initRefreshContainer();
    this.initTouchStart();
    this.initTouchMove();
    this.initTouchEnd();
  }
}
