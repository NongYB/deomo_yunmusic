// pages/playlist/playlist.js
import request from '../../utils/request'
import PubSub from 'pubsub-js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listid: '', //歌单Id
    playList:[], //歌曲对象
    listImg:'',  //歌单图片
    playListName:'', //歌单名字
    index:0,     //歌曲下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let listid = options.id
    this.setData({
      listid
    })

    //调用获取歌单的回调
    this.getPlayList(listid);

    //订阅来自songDetail页面发布的消息
  PubSub.subscribe('switchType',(msg,type)=>{
    let {playList,index} =this.data;
    if(type==='pre'){
      (index === 0) && (index = playList.length);
      index -=1;
    }else{
      (index === playList.length - 1 ) && (index = -1);
      index +=1;
    }

    //更新小标
    this.setData({
      index:index
    })

    let musicId = playList[index].id;
    
    PubSub.publish('musicId',musicId);
  })
  },

  //获取歌单对应的歌曲
  async getPlayList(listid){
    let playListData =await request('/playlist/detail',{id: listid});
    this.setData({
      playList:playListData.playlist.tracks,
      listImg:playListData.playlist.coverImgUrl,
      playListName:playListData.playlist.name
    })
  },

  //跳转至播放页面
  toSongDetail(event){
    let {song,index} =event.currentTarget.dataset;

    this.setData({
      index:index
    })

    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId='+song.id,
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