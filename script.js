// 使う画像をあらかじめ準備する
// const images = ['image1.jpg', 'image2.jpg']; ← 古いのは削除するか、コメントアウトする

// ↓ 新しいデータの形（オブジェクトの配列）
const records = [
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
    // ,
    // {
    //     image: 'image3.jpg',
    //     date: '2025-12-10',
    //     memo: 'さらに1ヶ月。明らかに見た目が変わってきた！'
    // } // ← 将来画像を追加するときは、このようにカンマで区切って足していきます
];

let currentIndex = 0; // 今、何番目（0から数える）のデータを表示しているか

// HTMLの「名前」がついた部品（要素）を取得する
const mainImage = document.getElementById('mainImage');
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
    // 1. フォーム送信によるページの自動リロードを防ぐ（超重要！）
    event.preventDefault(); 
    
    // 2. 入力された値を取得する
    const date = dateInput.value;
    const memo = memoInput.value;
    const imageFile = imageInput.files[0]; // 画像ファイルは .files[0] で取得

    // 3. 画像ファイルが選ばれていなかったら、処理を中断
    if (!imageFile) {
        alert('画像ファイルを選択してください。');
        return; // これ以降の処理をしない
    }

    // 4. 画像ファイルを「URL」に変換する（ブラウザの機能を使う）
    // (これが画像ファイルをブラウザで表示するための「おまじない」です)
    const imageUrl = URL.createObjectURL(imageFile);
    
    // 5. 新しいデータ（オブジェクト）を作成する
    const newRecord = {
        image: imageUrl,
        date: date,
        memo: memo
    };
    
    // 6. records 配列の「最後」に新しいデータを追加する
    records.push(newRecord);
    
    // 7. スライドショーの現在位置を、一番最後（追加したデータ）に更新
    currentIndex = records.length - 1;
    
    // 8. 画面を更新して、追加した最新のデータを表示する
    updateDisplay();
    
    // 9. フォームの入力内容をリセット（クリア）する
    recordForm.reset();
    
    // 10. ユーザーにお知らせ
    alert('新しい記録を保存しました！\n（※リロードすると消えます）');
});