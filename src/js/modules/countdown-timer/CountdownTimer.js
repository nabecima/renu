/**
 * CountdownTimer - カウントダウンタイマー機能
 * ページ読み込みから指定した時間（60分）でカウントダウンを実行
 */
export default class CountdownTimer {
  constructor(options = {}) {
    this.duration = options.duration || 60 * 60 * 1000; // デフォルト60分（ミリ秒）
    this.selector = options.selector || '.countdown-timer';
    this.debug = options.debug || false;
    this.storageKey = 'countdown_timer_start';

    this.initializeTiming();
    this.intervalId = null;

    this.init();
  }

  initializeTiming() {
    const savedStartTime = localStorage.getItem(this.storageKey);

    if (savedStartTime) {
      this.startTime = parseInt(savedStartTime, 10);
    } else {
      this.startTime = Date.now();
      localStorage.setItem(this.storageKey, this.startTime.toString());
    }

    this.endTime = this.startTime + this.duration;
  }

  init() {
    this.elements = document.querySelectorAll(this.selector);

    if (this.elements.length === 0) {
      if (this.debug) {
        console.warn(`CountdownTimer: セレクター "${this.selector}" の要素が見つかりません`);
      }
      return;
    }

    this.startCountdown();

    if (this.debug) {
      console.log('CountdownTimer: 初期化完了', {
        duration: this.duration,
        elements: this.elements.length
      });
    }
  }

  startCountdown() {
    this.updateDisplay();

    this.intervalId = setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }

  updateDisplay() {
    const now = Date.now();
    const remaining = Math.max(0, this.endTime - now);

    const totalMinutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    this.elements.forEach(element => {
      const minEl = element.querySelector('.min');
      const secEl = element.querySelector('.sec');

      if (minEl) minEl.textContent = totalMinutes.toString().padStart(2, '0');
      if (secEl) secEl.textContent = seconds.toString().padStart(2, '0');
    });

    if (remaining === 0) {
      this.onComplete();
    }
  }

  onComplete() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.debug) {
      console.log('CountdownTimer: カウントダウン終了');
    }
  }

  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset() {
    localStorage.removeItem(this.storageKey);
    this.initializeTiming();
    this.updateDisplay();
  }
}