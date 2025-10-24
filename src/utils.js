
Date.prototype.format = function (formatString) {
  const pad = (number) => (number < 10 ? '0' + number : number);

  return formatString.replace(/YYYY|MM|DD|HH|mm|ss|fff/g, (match) => {
    switch (match) {
      case 'YYYY':
        return this.getFullYear();
      case 'MM':
        return pad(this.getMonth() + 1);
      case 'DD':
        return pad(this.getDate());
      case 'HH':
        return pad(this.getHours());
      case 'mm':
        return pad(this.getMinutes());
      case 'ss':
        return pad(this.getSeconds());
      case 'fff':
        return pad(this.getMilliseconds());
      default:
        return match;
    }
  });
};

/**
 * @param {string} time
 * @returns {string}
 */
export function formatTime(time) {
  if (!time) return ''
  return new Date(time).format('YYYY-MM-DD HH:mm:ss')
}

export const setScreenSize = (elem) => {
  const box = document.getElementById('play-area')
  const height = box.offsetHeight - 56
  const width = height*720/1280
  elem.style.width = `${width}px`
  elem.style.height = `${height}px`
}
export const loadFile = async (accept) => {
  const [fileHandle] = await window.showOpenFilePicker({ types: [{ accept }] });
  return (await fileHandle.getFile());
}


// 素材默认居中填充
export function calculateScaledSize(content) {
  const containerWidth = 720;
  const containerHeight = 1280;
  const contentWidth = content.width;
  const contentHeight = content.height;
  
  // 计算宽高比例
  const containerRatio = containerWidth / containerHeight;
  const contentRatio = contentWidth / contentHeight;
  
  let scaledWidth, scaledHeight, fitType;
  let scale;
  
  // 判断适配方式
  if (contentRatio > containerRatio) {
      // 宽度受限 - 以宽度为基准缩放
      fitType = 'width';
      scaledWidth = containerWidth;
      scaledHeight = containerWidth / contentRatio;
      scale = scaledWidth / contentWidth;
  } else {
      // 高度受限 - 以高度为基准缩放
      fitType = 'height';
      scaledHeight = containerHeight;
      scaledWidth = containerHeight * contentRatio;
      scale = scaledHeight / contentHeight;
  }
  
  // 计算居中位置
  const x = (containerWidth - scaledWidth) / 2;
  const y = (containerHeight - scaledHeight) / 2;
  
  return {
      w: scaledWidth,
      h: scaledHeight,
      x: x,
      y: y
  };
}

// 密码校验
export const validatePassword = (rule, value, callback) => {
  if (value === '' || value === null || value === undefined) {
    callback(new Error('请输入密码'))
  }
  if (value.length < 6 || value.length > 15) {
    callback(new Error('密码长度在6-15个字符以内'))
  }
  if (/^[A-Za-z0-9]+$/.test(value)) {
    callback()
  } else {
    callback(new Error('密码只允许数字和字母'))
  }
}


// 节流函数
export function throttle(fn, delay) {
  let timer = null;
  let lastTime = 0;
  
  return function(...args) {
    const now = Date.now();
    const remaining = delay - (now - lastTime);
    
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      fn.apply(this, args);
      lastTime = now;
    } else if (!timer) {
      timer = setTimeout(() => {
        fn.apply(this, args);
        lastTime = Date.now();
        timer = null;
      }, remaining);
    }
  };
}

// 毫秒长度转为时间格式字符串
export function formatDurationWithMs(ms) {
  if (typeof ms !== 'number' || isNaN(ms)) return '00:00:00.000';
  
  ms = Math.max(0, ms);
  
  const seconds = Math.floor(ms / 1000) % 60;
  const minutes = Math.floor(ms / (1000 * 60)) % 60;
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const milliseconds = Math.floor(ms % 1000);
  
  const pad = (num, len = 2) => num.toString().padStart(len, '0');
  
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(milliseconds, 3)}`;
}

export function generateUniqueName(originalName) {
  const pointIndex = originalName.lastIndexOf('.')
  const fileName = originalName.substring(0, pointIndex)
  const extension = originalName.substring(pointIndex);
  const timestamp = new Date().getTime();
  return `${fileName}_${timestamp}${extension}`;
}