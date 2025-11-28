// =================================================================
// 状態管理用変数
// =================================================================
let records = [];         // 記録データ
let currentIndex = 0;     // 現在の画像インデックス
let slideInterval = null; // スライドショーのタイマーID

// =================================================================
// 初期化・イベント設定
// =================================================================
document.addEventListener('DOMContentLoaded', () => {
    
    // 要素の取得
    const els = {
        mainImage: document.getElementById('mainImage'),
        recordDate: document.getElementById('recordDate'),
        recordMemo: document.getElementById('recordMemo'),
        prevBtn: document.getElementById('prevButton'),
        nextBtn: document.getElementById('nextButton'),
        playPauseBtn: document.getElementById('playPauseButton'),
        deleteBtn: document.getElementById('deleteButton'),
        timeInput: document.getElementById('timeInput'),
        form: document.getElementById('recordForm'),
        inputs: {
            date: document.getElementById('dateInput'),
            memo: document.getElementById('memoInput'),
            image: document.getElementById('imageInput')
        },
        // 時間調整ボタン群
        timeBtns: {
            p1: document.getElementById('plus1sButton'),
            m1: document.getElementById('minus1sButton'),
            p01: document.getElementById('plus01sButton'),
            m01: document.getElementById('minus01sButton'),
        }
    };

    // 初期ロード
    loadRecords();
    updateDisplay();

    // ----------------------------------------------------
    // イベントリスナー
    // ----------------------------------------------------

    // スライド操作
    els.prevBtn.addEventListener('click', () => { stopSlideshow(); changeIndex(-1); });
    els.nextBtn.addEventListener('click', () => { stopSlideshow(); changeIndex(1); });
    
    // 再生・停止
    els.playPauseBtn.addEventListener('click', toggleSlideshow);

    // 時間調整
    els.timeBtns.p1.addEventListener('click', () => updateTimeInput(1.0));
    els.timeBtns.m1.addEventListener('click', () => updateTimeInput(-1.0));
    els.timeBtns.p01.addEventListener('click', () => updateTimeInput(0.1));
    els.timeBtns.m01.addEventListener('click', () => updateTimeInput(-0.1));

    // 削除
    els.deleteBtn.addEventListener('click', deleteCurrentRecord);

    // 新規登録
    els.form.addEventListener('submit', handleSave);


    // =================================================================
    // ロジック関数
    // =================================================================

    // --- データ読み書き ---
    function loadRecords() {
        const json = localStorage.getItem('muscleRecords');
        if (json) {
            records = JSON.parse(json);
            // 日付順ソート
            records.sort((a, b) => new Date(a.date) - new Date(b.date));
            // 最新を表示
            currentIndex = records.length > 0 ? records.length - 1 : 0;
        } else {
            records = [];
        }
    }

    function saveRecords() {
        localStorage.setItem('muscleRecords', JSON.stringify(records));
    }

    // --- 画面表示 ---
    function updateDisplay() {
        if (records.length === 0) {
            els.mainImage.src = '';
            els.mainImage.style.display = 'none'; // 画像がない時は非表示枠などを調整
            els.mainImage.parentElement.style.minHeight = '350px'; // 高さは確保
            els.recordDate.textContent = '---';
            els.recordMemo.textContent = '下のフォームから最初の記録を追加してください。';
            return;
        }

        els.mainImage.style.display = 'block';
        
        // インデックス範囲チェック
        if (currentIndex >= records.length) currentIndex = records.length - 1;
        if (currentIndex < 0) currentIndex = 0;

        const data = records[currentIndex];
        els.mainImage.src = data.image;
        els.recordDate.textContent = data.date;
        els.recordMemo.textContent = data.memo;
    }

    function changeIndex(step) {
        if (records.length === 0) return;
        currentIndex += step;

        // ループ処理
        if (currentIndex >= records.length) currentIndex = 0;
        if (currentIndex < 0) currentIndex = records.length - 1;
        
        updateDisplay();
    }

    // --- 時間設定 ---
    function updateTimeInput(val) {
        stopSlideshow();
        let current = parseFloat(els.timeInput.value);
        let next = current + val;
        if (next < 0.1) next = 0.1;
        els.timeInput.value = Math.round(next * 10) / 10;
    }

    // --- スライドショー ---
    function toggleSlideshow() {
        if (slideInterval) {
            stopSlideshow();
        } else {
            startSlideshow();
        }
    }

    function startSlideshow() {
        if (records.length <= 1) return;

        const sec = parseFloat(els.timeInput.value);
        if (sec < 0.1 || isNaN(sec)) {
            alert('時間を正しく設定してください');
            return;
        }

        // アイコンを停止に変更
        els.playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        els.playPauseBtn.classList.add('pause-button');

        slideInterval = setInterval(() => {
            changeIndex(1);
        }, sec * 1000);
    }

    function stopSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
        // アイコンを再生に戻す
        els.playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        els.playPauseBtn.classList.remove('pause-button');
    }

    // --- 削除 ---
    function deleteCurrentRecord() {
        if (records.length === 0) return;
        
        if (!confirm(`日付: ${records[currentIndex].date}\nこの記録を削除しますか？`)) return;

        records.splice(currentIndex, 1);
        saveRecords();
        
        if (currentIndex >= records.length) {
            currentIndex = records.length - 1;
        }
        
        alert('削除しました。');
        updateDisplay();
    }

    // --- 保存 ---
    function handleSave(e) {
        e.preventDefault();
        const file = els.inputs.image.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            const newRecord = {
                date: els.inputs.date.value,
                memo: els.inputs.memo.value,
                image: event.target.result // Base64
            };

            records.push(newRecord);
            records.sort((a, b) => new Date(a.date) - new Date(b.date));
            saveRecords();
            
            // 追加したデータを表示
            currentIndex = records.indexOf(newRecord);
            updateDisplay();

            // フォームリセット
            els.form.reset();
            alert('記録しました！');
        };
        reader.readAsDataURL(file);
    }
});