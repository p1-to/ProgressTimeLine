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

// ★新しく「画面を更新する関数」を作る
function updateDisplay() {
    // 現在の番号（currentIndex）に基づいて、表示するデータを取得
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
});