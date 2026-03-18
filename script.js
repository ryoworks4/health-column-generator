var topicInput = document.getElementById('topic-input');
var charCount = document.getElementById('char-count');
var generateBtn = document.getElementById('generate-btn');
var resultArea = document.getElementById('result-area');
var copyBtn = document.getElementById('copy-btn');
var modeButtons = document.querySelectorAll('.mode-btn');
var toneButtons = document.querySelectorAll('.tone-btn');
var exampleTags = document.querySelectorAll('.example-tag');

var selectedMode = 'blog';
var selectedTone = 'friendly';

// 文字数カウント
topicInput.addEventListener('input', function () {
    charCount.textContent = this.value.length;
});

// モード切替
modeButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        modeButtons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        selectedMode = this.dataset.mode;
    });
});

// トーン切替
toneButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
        toneButtons.forEach(function (b) { b.classList.remove('active'); });
        this.classList.add('active');
        selectedTone = this.dataset.tone;
    });
});

// サンプルタグクリック
exampleTags.forEach(function (tag) {
    tag.addEventListener('click', function () {
        topicInput.value = this.textContent;
        charCount.textContent = this.textContent.length;
        topicInput.focus();
    });
});

// Enterキーで生成
topicInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        generateBtn.click();
    }
});

// 生成実行
generateBtn.addEventListener('click', async function () {
    var topic = topicInput.value.trim();

    if (!topic) {
        resultArea.innerHTML = '<p class="error-text">テーマを入力してください</p>';
        return;
    }

    if (topic.length > 200) {
        resultArea.innerHTML = '<p class="error-text">200文字以内で入力してください</p>';
        return;
    }

    // ローディング表示
    generateBtn.disabled = true;
    generateBtn.textContent = '生成中...';
    copyBtn.style.display = 'none';
    resultArea.innerHTML = '<div class="loading"><span></span><span></span><span></span></div>';

    try {
        var response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: topic, mode: selectedMode, tone: selectedTone })
        });

        var responseText = await response.text();

        if (!response.ok) {
            var errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                errorData = { error: '通信エラーが発生しました' };
            }
            resultArea.innerHTML = '<p class="error-text">' + escapeHtml(errorData.error) + '</p>';
            return;
        }

        var data = JSON.parse(responseText);
        var modeLabel = { blog: 'ブログ記事', sns: 'SNS投稿', poster: '院内掲示' };
        resultArea.innerHTML = '<div class="result-content">' +
            '<div class="result-header">' +
            '<span class="result-topic">' + escapeHtml(topic) + '</span>' +
            '<span class="result-mode">' + modeLabel[selectedMode] + '</span>' +
            '</div>' +
            '<div class="result-text">' + escapeHtml(data.result) + '</div>' +
            '</div>';
        copyBtn.style.display = 'block';
    } catch (error) {
        resultArea.innerHTML = '<p class="error-text">通信エラーが発生しました。もう一度お試しください。</p>';
    } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = 'コラムを生成する';
    }
});

// コピー
copyBtn.addEventListener('click', function () {
    var resultText = document.querySelector('.result-text');
    if (resultText) {
        navigator.clipboard.writeText(resultText.textContent).then(function () {
            copyBtn.textContent = 'コピーしました！';
            setTimeout(function () {
                copyBtn.textContent = 'コピー';
            }, 2000);
        });
    }
});

// HTMLエスケープ
function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
