/* eslint-disable no-undef */
/* eslint-disable no-console */
function findEleAndDosth() {
  async function getPostLikedPeople(commentUrl, inId) {
    const prefixUrl = '/k/api/post/likeList.json?_lc=zh&_ref='
    const haveNotLikedMembers = await kintone.api(
      kintone.api.url(prefixUrl + encodeURIComponent(commentUrl), true),
      'POST',
      {
        id: inId,
      },
    )
    return haveNotLikedMembers.result.items
  }

  async function getCommentLikedPeople(commentUrl, inId) {
    const prefixUrl = '/k/api/comment/likeList.json?_lc=zh&_ref='
    const haveNotLikedMembers = await kintone.api(
      kintone.api.url(prefixUrl + encodeURIComponent(commentUrl), true),
      'POST',
      {
        id: inId,
      },
    )
    return haveNotLikedMembers.result.items
  }

  function findMentionedMembers(elementCommentBlock) {
    const arrayComputedMembers = []
    const arrayMentionedItems = elementCommentBlock.querySelectorAll('.ocean-ui-plugin-mention-user')
    console.log(arrayMentionedItems)
    console.log(3334)
    for (let i = 0; i < arrayMentionedItems.length; i += 1) {
      console.log(arrayMentionedItems[i])
      console.log(arrayMentionedItems[i].hasAttribute('data-mention-id'))
      console.log(arrayMentionedItems[i].hasAttribute('data-org-mention-id'))
      console.log(arrayMentionedItems[i].hasAttribute('data-group-mention-id'))
      arrayComputedMembers.push(arrayMentionedItems[i])
    }
    return arrayComputedMembers
  }

  // 判断是评论(Post)还是评论的回复(comment)
  function checkPostOrComment(commentUrl) {
    const lastId = commentUrl.substring(commentUrl.lastIndexOf('/') + 1)
    const slashAmountAfterThread = commentUrl.substring(commentUrl.lastIndexOf('thread')).split('/').length - 1
    if (slashAmountAfterThread === 2) {
      return { type: 'post', id: lastId }
    }
    if (slashAmountAfterThread === 3) {
      return { type: 'comment', id: lastId }
    }
    throw new Error('预期外的URL')
  }

  async function doYourWork() {
    // 找到回复的块
    const elesAllComment = document.querySelectorAll('.ocean-ui-comments-commentbase-entity')
    // 对这些块进行循环
    for (let i = 0; i < elesAllComment.length; i += 1) {
      // 找到本回复的链接，类似
      // https://xxx.cybozu.cn/k/#/space/6/thread/9/10/20
      const stringNodePostLink = elesAllComment[i]
        .querySelector('.ocean-ui-comments-commentbase-time > a')
        .getAttribute('href')
      const checkCommentTypeResult = checkPostOrComment(stringNodePostLink)
      // 创建一个检查按钮并加入【赞】的后面
      const btnCheckUnlike = document.createElement('BUTTON')
      const checkButton = document.createTextNode('check like')
      btnCheckUnlike.appendChild(checkButton)
      elesAllComment[i].querySelector('.ocean-ui-comments-commentbase-like').parentElement.appendChild(btnCheckUnlike)
      // 按钮的事件
      btnCheckUnlike.onclick = async () => {
        let arrayHaveNotLikedMembers
        if (checkCommentTypeResult.type === 'post') {
          arrayHaveNotLikedMembers = await getPostLikedPeople(stringNodePostLink, checkCommentTypeResult.id)
        } else if (checkCommentTypeResult.type === 'comment') {
          arrayHaveNotLikedMembers = await getCommentLikedPeople(stringNodePostLink, checkCommentTypeResult.id)
        }
        // 测试输出点赞的用户们
        console.log(arrayHaveNotLikedMembers)
      }
      // 找到@的元素们
      const arrayMentionedMembers = findMentionedMembers(elesAllComment[i])
      console.log(arrayMentionedMembers)
      // todo 区分是人还是组织还是组，分别调api
    }
  }

  // 给kintone加载内容一些时间
  setTimeout(doYourWork, 3000)
}

// 切换thread的时候也会调用
onhashchange = findEleAndDosth
// 初次执行
findEleAndDosth()
