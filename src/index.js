/* eslint-disable no-undef */
/* eslint-disable no-console */

function iWillWinTheHackathon() {
  function findHaventLikeUsers(arrayMentionedUsers, arrayHaveLikedUsers) {
    for (let i = 0; i < arrayHaveLikedUsers.length; i += 1) {
      for (let j = 0; j < arrayMentionedUsers.length; j += 1) {
        if (arrayHaveLikedUsers[i].id === arrayMentionedUsers[j].id) {
          arrayMentionedUsers.splice(j, 1)
        }
      }
    }
    return arrayMentionedUsers
  }
  function unique(arr) {
    const ret = []
    const len = arr.length
    let isRepeat
    for (let i = 0; i < len; i += 1) {
      isRepeat = false
      for (let j = i + 1; j < len; j += 1) {
        if (arr[i].id === arr[j].id) {
          isRepeat = true
          break
        }
      }
      if (!isRepeat) {
        ret.push(arr[i])
      }
    }
    return ret
  }

  async function getPostLikedPeople(inId) {
    const prefixUrl = '/k/api/post/likeList.json'
    const haveNotLikedMembers = await kintone.api(kintone.api.url(prefixUrl, true), 'POST', {
      id: inId,
    })
    return haveNotLikedMembers.result.items
  }

  async function getCommentLikedPeople(inId) {
    const prefixUrl = '/k/api/comment/likeList.json'
    const haveNotLikedMembers = await kintone.api(kintone.api.url(prefixUrl, true), 'POST', {
      id: inId,
    })
    return haveNotLikedMembers.result.items
  }

  async function getUserByCode(userCode) {
    const stringApi = '/k/api/people/user/getByCode.json'
    try {
      const objUser = await kintone.api(kintone.api.url(stringApi, true), 'POST', {
        code: userCode,
      })
      return objUser.result.item
    } catch (e) {
      console.log(e)
      throw new Error('获取用户的时候出错')
    }
  }
  async function getUsersByOrgOrGroup(spaceId, collectionType, id) {
    const stringApi = '/k/api/ntf/listMentionRecipients.json'
    const objPostBody = collectionType === 'org' ? { orgMention: id } : { groupMention: id }
    objPostBody.spaceId = spaceId
    try {
      const objResponse = await kintone.api(kintone.api.url(stringApi, true), 'POST', objPostBody)
      return objResponse.result.users
    } catch (e) {
      console.log(e)
      throw new Error('获取组织或组的时候出错g')
    }
  }

  async function findMentionedMembers(elementCommentBlock, spaceId) {
    const arrayPromiseGetUserTask = []
    const arrayPromeseGetUsersInOrgTask = []
    const arrayPromeseGetUsersInGroupTask = []
    const arrayMentionedItems = elementCommentBlock.querySelectorAll('.ocean-ui-plugin-mention-user')
    arrayMentionedItems.forEach((element) => {
      if (element.hasAttribute('data-mention-id')) {
        const stringUserHref = element.getAttribute('href')
        const stringUserCode = stringUserHref.split('/k/#/people/user/').pop()
        const objUser = getUserByCode(stringUserCode)
        arrayPromiseGetUserTask.push(objUser)
      }
      if (element.hasAttribute('data-org-mention-id')) {
        arrayPromeseGetUsersInOrgTask.push(
          getUsersByOrgOrGroup(spaceId, 'org', element.getAttribute('data-org-mention-id')),
        )
      }
      if (element.hasAttribute('data-group-mention-id')) {
        arrayPromeseGetUsersInGroupTask.push(
          getUsersByOrgOrGroup(spaceId, 'group', element.getAttribute('data-group-mention-id')),
        )
      }
    })

    const arraySingleUsers = await Promise.all(arrayPromiseGetUserTask)
    console.log(arraySingleUsers)
    const arrayOrgUsers = await Promise.all(arrayPromeseGetUsersInOrgTask)
    console.log(arrayOrgUsers)
    const arrayGroupUsers = await Promise.all(arrayPromeseGetUsersInGroupTask)
    console.log(arrayGroupUsers)
    const arrayTogether = arraySingleUsers.concat(...arrayOrgUsers).concat(...arrayGroupUsers)
    console.log(arrayTogether)
    const arrayComputedMentionedUsers = unique(arrayTogether)
    return arrayComputedMentionedUsers
  }

  // 判断是评论(Post)还是评论的回复(comment)
  function getCommentInfo(commentUrl) {
    const regex = /\/k\/#\/space\/(\d+)\/thread\/(\d+)\/(\d+)\/*(\d*)/
    const arrayFound = commentUrl.match(regex)
    const objInfo = {
      spaceId: arrayFound[1],
      threadId: arrayFound[2],
      postId: arrayFound[3],
      commentId: arrayFound[4],
    }
    return objInfo
  }

  async function mainTask() {
    // 找到回复的块
    const arrayAllComments = document.querySelectorAll('.ocean-ui-comments-commentbase-entity')
    // 对这些块进行循环
    // const asyncTasks = []
    for (let i = 0; i < arrayAllComments.length; i += 1) {
      const stringNodePostLink = arrayAllComments[i]
        .querySelector('.ocean-ui-comments-commentbase-time > a')
        .getAttribute('href')
      const objCommentInfo = getCommentInfo(stringNodePostLink)
      // 创建一个检查按钮并加入【赞】的后面 kintone fu
      const btnCheckUnlike = document.createElement('a')
      btnCheckUnlike.classList.add('ocean-ui-comments-commentbase-like')
      btnCheckUnlike.style.cssText = 'min-width: 1px; user-select: none;margin-left:8px'
      const checkButton = document.createTextNode('谁没赞')
      btnCheckUnlike.appendChild(checkButton)
      arrayAllComments[i].querySelector('.ocean-ui-comments-commentbase-like').parentElement.appendChild(btnCheckUnlike)
      // 按钮的事件
      btnCheckUnlike.onclick = async () => {
        let arrayHaveLikedUsers
        if (objCommentInfo.commentId) {
          arrayHaveLikedUsers = await getCommentLikedPeople(objCommentInfo.commentId)
        } else {
          arrayHaveLikedUsers = await getPostLikedPeople(objCommentInfo.postId)
        }
        // 测试输出点赞的用户们
        console.log('谁点赞了：')
        console.log(arrayHaveLikedUsers)
        // find @
        const arrayMentionedUsers = await findMentionedMembers(arrayAllComments[i], objCommentInfo.spaceId)
        console.log('@谁了：')
        console.log(arrayMentionedUsers)
        const arrayFinalHaventLikedUsers = findHaventLikeUsers(arrayMentionedUsers, arrayHaveLikedUsers)
        console.log('谁没点赞呀：')
        console.log(arrayFinalHaventLikedUsers)
      }
      // 找到@的元素们
      // asyncTasks.push(findMentionedMembers(elesAllComment[i]))ddd
      // console.log(arrayMentionedMembers)
      // todo 区分是人还是组织还是组，分别调api
    }
    // try {
    // await Promise.all(asyncTasks)
    // } catch (error) {
    //   console.log(error)
    // }
  }

  // 给kintone加载内容一些时间
  setTimeout(mainTask, 3000)
}

// 切换thread的时候也会调用
onhashchange = iWillWinTheHackathon
// 初次执行
iWillWinTheHackathon()
