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

  async function getUserByCode(userCode) {
    console.log('before get userss')
    const prefixUrl =
      '/k/api/people/user/getByCode.json?_lc=zh&_ref=https%3A%2F%2Fcndevqpofif.cybozu.cn%2Fk%2F%23%2Fpeople%2Fuser%2F'
    try {
      const objUser = await kintone.api(kintone.api.url(prefixUrl + userCode, true), 'POST', {
        code: userCode,
      })
      console.log('after get userss')
      return objUser.result.item
    } catch (e) {
      return e
    }
  }

  async function findMentionedMembers(elementCommentBlock) {
    const arrayComputedMentionedUsers = []
    // const arrayMentionedUserId = []
    const arrayMentionedItems = elementCommentBlock.querySelectorAll('.ocean-ui-plugin-mention-user')
    // console.log(arrayMentionedItems)
    for (let i = 0; i < arrayMentionedItems.length; i += 1) {
      // console.log(arrayMentionedItems[i])
      // console.log(arrayMentionedItems[i].hasAttribute('data-mention-id'))
      // console.log(arrayMentionedItems[i].hasAttribute('data-org-mention-id'))
      // console.log(arrayMentionedItems[i].hasAttribute('data-group-mention-id'))
      if (arrayMentionedItems[i].hasAttribute('data-mention-id')) {
        const stringUserHref = arrayMentionedItems[i].getAttribute('href')
        const stringUserCode = stringUserHref.split('/k/#/people/user/').pop()
        // console.log(stringUserCode)
        const objUser = getUserByCode(stringUserCode)
        arrayComputedMentionedUsers.push(objUser)
        // arrayMentionedUserId.push('fake user code  4 ')
        // console.log(arrayMentionedUserId)
      }
      if (arrayMentionedItems[i].hasAttribute('data-org-mention-id')) {
        // console.log('find org item  ')
      }
      if (arrayMentionedItems[i].hasAttribute('data-group-mention-id')) {
        // console.log('find group item')
      }
    }
    const haha = await Promise.all(arrayComputedMentionedUsers)
    console.log(haha)
    return haha
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
    const asyncTasks = []
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
      asyncTasks.push(findMentionedMembers(elesAllComment[i]))
      // console.log(arrayMentionedMembers)
      // todo 区分是人还是组织还是组，分别调api
    }
    // try {
    await Promise.all(asyncTasks)
    // } catch (error) {
    //   console.log(error)
    // }
  }

  // 给kintone加载内容一些时间
  setTimeout(doYourWork, 3000)
}

// 切换thread的时候也会调用
onhashchange = findEleAndDosth
// 初次执行
findEleAndDosth()
