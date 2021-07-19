# kin-like-check

## 油猴中的调试

开发时为节省时间，用油猴的方式做调试。

借用油猴的require，引本地的localhost server，这样可以做到改动代码立即出效果。

由于油猴的require有缓存机制，先把油猴设置中的外部→更新间隔→总是

即使这样，也只会对前一次的保存起作用，所以本地代码需要保存两次，反映的是倒数第二次的效果。


具体步骤：

- 先把script.js的内容考入油猴
- 切TamperMonkeyInjectDev分支
- npm i
- npm start
- kintone中看效果

## 开发提示：

开发中需要注意的地方，踩中的坑等等，列在下面。

[Dev Note](https://beryl-appliance-bc9.notion.site/This-is-the-way-to-detect-unlike-c20e803417d3427289b11d70c7ecdffd)
