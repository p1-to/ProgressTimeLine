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