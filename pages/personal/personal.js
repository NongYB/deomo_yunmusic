// pages/personal/personal.js
import request from '../../utils/request'

let startY =0;  //手指起始的坐标
let moveY=0;   //手指移动的坐标
let moveDistance=0; //手指移动的距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform : "translateY(0)", //滑动的起始值
    coverTransition : '', //过渡效果
    userInfo: '', //用户基本信息
    recentPlayList:[], //播放记录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取用户的基本信息
    let userInfo =wx.getStorageSync('userInfo');
    if(userInfo){
      //更新userInfo的状态
      this.setData({
        userInfo:JSON.parse(userInfo)
      })
      //播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
  },
  
  //获取用户的播放记录
 async getUserRecentPlayList(userId){
    let recentPlayListData =await request('/user/record',{uid:userId,type:0});
    let index=0;
    //为了增加标识id
    let recentPlayList=recentPlayListData.allData.splice(0,10).map(item=>{
      item.id=index++;
      return item;
    })
    this.setData({
      recentPlayList:recentPlayList
    })
  },


  handleTouchStart(event){
    //获取手指起始坐标
    startY =event.touches[0].clientY;

    this.setData({
     
      coverTransition : ''
    })
    
  },
  handleTouchMove(event){
    moveY =event.touches[0].clientY;
    moveDistance =moveY-startY;

    if(moveDistance<=0){
      return;
    }
    if(moveDistance>=80){
      moveDistance=80;
    }
    //动态获取更新coverTransform的状态值
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`
    })
  },
  handleTouchEnd(){
    //重置coverTransform
    this.setData({
      coverTransform: `translateY(${0}rpx)`,
      coverTransition : 'transform 1s linear'
    })
  },
  //跳转登录
  toLogin(){
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  //退出登录
 async logout2(){
  let result = await request('/logout');
  if(result.code===200){
    wx.showToast({
      title: '退出登录成功',
    })
    //清除本地缓存
    wx.removeStorage({
      key: 'userInfo'
    })
    wx.removeStorage({
      key: 'cookies'
    })
    
    this.setData({
      userInfo: '',
      recentPlayList: ''
    })
    return;
  }
    
  },

  //退出登录按钮
  logout(){
    let _this=this;
    wx.showModal({
      title: '是否要退出？',
      success(res){
        if(res.confirm){
             _this.logout2();
            // this.logout2();
        } else if(res.cancel){
          wx.showToast({
            title: '取消退出',
            icon: 'none'
          })
        }
      }
    })
   
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})