// ------------------------------
// localStorage 関連の関数
// ------------------------------

// 【保存する関数】
// records配列をlocalStorageに丸ごと保存する
function saveRecords() {
    // 1. 配列を「JSON」というテキスト形式に変換する
    const jsonRecords = JSON.stringify(records);
    // 2. "muscleRecords" という名前でlocalStorageに保存する
    localStorage.setItem('muscleRecords', jsonRecords);
}

// 【読み込む関数】
// localStorageからデータを読み込んで返す
function loadRecords() {
    // 1. "muscleRecords" という名前でlocalStorageからテキストデータを取得
    const jsonRecords = localStorage.getItem('muscleRecords');
    
    // 2. もしデータが何も保存されていなければ（＝初回訪問時など）
    if (!jsonRecords) {
        // ★元々あった、初期データを返す
        return [
            {
                image: 'image1.jpg',
                date: '2025-10-01',
                memo: '筋トレ開始初日。まずは腕立て伏せから。'
            },
            {
                image: 'image2.jpg',
                date: '2025-11-05',
                memo: '1ヶ月経過。少し胸板が厚くなった気がする！ベンチプレス50kg挑戦。'
            }
        ];
    }
    
    // 3. もしデータがあれば、テキストを配列に戻して返す
    return JSON.parse(jsonRecords);
    // ★ --- 追記 --- ★
    // 日付が古い順（昇順）に並べ替える
    loadedData.sort((a, b) => new Date(a.date) - new Date(b.date));
    // ★ --- 追記 --- ★
    return loadedData;
}
// 使う画像をあらかじめ準備する
// const images = ['image1.jpg', 'image2.jpg']; ← 古いのは削除するか、コメントアウトする

// 【★変更点】localStorageからデータを読み込む
let records = loadRecords(); 

// 【★変更点】現在の位置を「一番最後のデータ」にする
let currentIndex = records.length - 1; 

// HTMLの「名前」がついた部品（要素）を取得する
const mainImage = document.getElementById('mainImage');
// ... (この下は変更なし) ...
// HTMLの「名前」がついた部品（要素）を取得する
const recordDate = document.getElementById('recordDate'); // ← ★追加
const recordMemo = document.getElementById('recordMemo'); // ← ★追加
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');
const deleteButton = document.getElementById('deleteButton');

// ★新しく「画面を更新する関数」を作る
function updateDisplay() {
    // ↓ここから追記（0件のときの処理）↓
    if (records.length === 0) {
        mainImage.src = ''; // (または 'placeholder.jpg' などの画像)
        mainImage.alt = '記録がありません';
        recordDate.textContent = '---';
        recordMemo.textContent = 'データを追加してください。';
        return; // これ以上、下の処理はしない
    }
    // ↓ここから追記（currentIndexが不正な値にならないよう調整）↓
    // もしcurrentIndexが配列の最後尾より大きければ、最後尾にする
    if (currentIndex >= records.length) {
        currentIndex = records.length - 1;
    }
    // もしcurrentIndexが0より小さければ、0にする
    if (currentIndex < 0) {
        currentIndex = 0;
    }
    // ↑ここまで追記↑
    const currentRecord = records[currentIndex]; 
    
    // 取得したデータで、HTMLの各部品を書き換える
    mainImage.src = currentRecord.image;
    recordDate.textContent = currentRecord.date;
    recordMemo.textContent = currentRecord.memo;
}

// 「次へ」ボタンが押されたときの処理
nextButton.addEventListener('click', () => {
    // 番号を1増やす
    currentIndex++;
    
    // もしデータの最後まで行ったら、最初に戻る
    if (currentIndex >= records.length) {
        currentIndex = 0;
    }
    
    // 画面を更新する
    updateDisplay(); // ← ★書き換えた
});

// 「前へ」ボタンが押されたときの処理
prevButton.addEventListener('click', () => {
    // 番号を1減らす
    currentIndex--;
    
    // もしデータの最初より前に戻ったら、最後に行く
    if (currentIndex < 0) {
        currentIndex = records.length - 1;
    }
    
    // 画面を更新する
    updateDisplay(); // ← ★書き換えた
});

// ★ページが読み込まれたときに、最初のデータを表示する
// （これは、HTMLに初期値を書いたので、無くてもOKですが、念のため）
updateDisplay();

// ------------------------------
// 入力フォームの処理（追記）
// ------------------------------

// フォームのHTML部品を取得する
const recordForm = document.getElementById('recordForm');
const dateInput = document.getElementById('dateInput');
const memoInput = document.getElementById('memoInput');
const imageInput = document.getElementById('imageInput');

// フォームの「保存ボタン」が押されたときの処理
recordForm.addEventListener('submit', (event) => {
    // 1. フォーム送信によるページの自動リロードを防ぐ
    event.preventDefault(); 
    
    // 2. 入力された値を取得する
    const date = dateInput.value;
    const memo = memoInput.value;
    const imageFile = imageInput.files[0];

    // 3. 画像ファイルが選ばれていなかったら、処理を中断
    if (!imageFile) {
        alert('画像ファイルを選択してください。');
        return;
    }

    // 4.【★最重要】FileReaderを使って画像をBase64テキストに変換する
    const reader = new FileReader();
    
    // 5. 画像の読み込みが完了したときの処理を、先に予約しておく
    reader.onload = (e) => {
        // e.target.result に、変換されたBase64テキストが入っている
        const imageUrl = e.target.result; 
        
        // 6. 新しいデータ（オブジェクト）を作成する
        const newRecord = {
            image: imageUrl, // Base64テキストを保存
            date: date,
            memo: memo
        };
        
        // 7. records 配列の「最後」に新しいデータを追加する
        records.push(newRecord);

        // ★ --- 追記 --- ★
        // 追加後、配列全体を日付でソートする
        records.sort((a, b) => new Date(a.date) - new Date(b.date));
        // ★ --- 追記 --- ★
        
        // 8.【★重要】localStorage に配列全体を保存する
        saveRecords();
        
        // 9. スライドショーの現在位置を、一番最後（追加したデータ）に更新
        currentIndex = records.length - 1;
        
        // 10. 画面を更新して、追加した最新のデータを表示する
        updateDisplay();
        
        // 11. フォームの入力内容をリセット（クリア）する
        recordForm.reset();
        
        // 12. ユーザーにお知らせ
        alert('新しい記録を保存しました！\n（リロードしても消えません）');
    };
    
    // 13. 実際に画像の読み込み（Base64変換）を開始する
    reader.readAsDataURL(imageFile);

    // ------------------------------
// 削除ボタンの処理（追記）
// ------------------------------

});
deleteButton.addEventListener('click', () => {
    // もし記録が0件なら、何もしない
    if (records.length === 0) {
        alert('削除する記録がありません。');
        return;
    }

    // 1. ユーザーに最終確認
    const currentRecord = records[currentIndex]; // 現在表示中のデータを取得
    const confirmation = confirm(
        `本当にこの記録を削除しますか？\n\n日付: ${currentRecord.date}\nメモ: ${currentRecord.memo}`
    );

    // 2. 「はい」(OK) が押されなかったら、処理を中断
    if (!confirmation) {
        return;
    }

    // 3. 配列から、現在表示中(currentIndex)のデータを1件削除
    records.splice(currentIndex, 1);

    // 4. localStorageを更新（削除後の配列を保存）
    saveRecords();

    // 5. 画面を更新
    // (updateDisplayが自動で0件の場合や、indexのズレを処理してくれます)
    alert('記録を削除しました。');
    updateDisplay();
});