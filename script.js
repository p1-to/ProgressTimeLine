// 使う画像をあらかじめ準備する
const images = ['image1.jpg', 'image2.jpg'];
let currentImageIndex = 0; // 今、何枚目の画像を表示しているか（0から数える）

// HTMLの「名前」がついた部品（要素）を取得する
const mainImage = document.getElementById('mainImage');
const prevButton = document.getElementById('prevButton');
const nextButton = document.getElementById('nextButton');

// 「次へ」ボタンが押されたときの処理
nextButton.addEventListener('click', () => {
    // 画像の番号を1増やす
    currentImageIndex++;
    
    // もし画像の最後まで行ったら、最初に戻る
    if (currentImageIndex >= images.length) {
        currentImageIndex = 0;
    }
    
    // 画像を切り替える
    mainImage.src = images[currentImageIndex];
});

// 「前へ」ボタンが押されたときの処理
prevButton.addEventListener('click', () => {
    // 画像の番号を1減らす
    currentImageIndex--;
    
    // もし画像の最初より前に戻ったら、最後に行く
    if (currentImageIndex < 0) {
        currentImageIndex = images.length - 1;
    }
    
    // 画像を切り替える
    mainImage.src = images[currentImageIndex];
});