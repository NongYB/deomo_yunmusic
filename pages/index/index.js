// pages/index/index.js

import PubSub from 'pubsub-js'
import request from '../../utils/request.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList:[], //轮播图数据
    recommendList:[], //推荐歌单
    topList:[],       //排行榜数据
    topListIndex:0,   //排行榜歌单下标
    index:0,         //排行榜音乐下标
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {  

    let bannerListData =await request('/banner',{type:2});
    this.setData({
      bannerList:bannerListData.banners
    })
    
    //获取推荐歌单数据
    let recommendListData= await request('/personalized',{limit:10})
    this.setData({
      recommendList:recommendListData.result
    })

    //获取排行榜数据
    /**
     * 需求分析：
     *  1.需要根据idx的值获取对应的数据
     *  2.idx的取值范围是0-20， 我们需要0-4
     *  3.需要发送5次请求
     * 前++ 和 后++的区别
     *  1.先看到是运算符还是值
     *  2.如果先看到的是运算符 就先运算再赋值
     *  3.如果先看到的是值 就先赋值再运算
     */

     let index=0;
     let resultArr=[];
     while(index <5 ){
      let topListData= await request('/top/list',{idx: index++});
      //数组方法 splice(会修改原数组，可以对指定的数组进行增删改) slice(不会修改原数组)
      let topListTtem ={name: topListData.playlist.name, tracks: topListData.playlist.tracks.slice(0,3)};
      resultArr.push(topListTtem);
      //不需要等待五次请求全部结束才更新，用户体验较好，但是渲染次数会多一些
      this.setData({
        topList:resultArr
     })
     }
   //更新topList的状态值,放在此处更新会导致发送请求的过程中页面长时间白屏，用户体验差
  //  this.setData({
  //     topList:resultArr
  //  })

  //订阅来自songDetail页面发布的消息
  // PubSub.subscribe('switchType',(msg,type)=>{
  //   let {topList,index,topListIndex} =this.data;
  //   if(type==='pre'){
  //     (index === 0) && (index = topList[topListIndex].tracks.length);
  //     index -=1;
  //   }else{
  //     (index === topList[topListIndex].tracks.length - 1 ) && (index = -1);
  //     index +=1;
  //   }

  //   //更新小标
  //   this.setData({
  //     index:index
  //   })

  //   let musicId = topList[topListIndex].tracks[index].id;
  //   // console.log(topList[topListIndex]);
  //   // console.log(index);
  //   PubSub.publish('musicId',musicId);
  // })
  },

  //跳转到每日推荐
  toRecommendSong(){
    wx.navigateTo({
      url: '/pages/recommendSong/recommendSong',
    })
  },
  //排行榜跳转到播放页面
  toSongDetail(event){
    
    let {song,index} =event.currentTarget.dataset;
    
    

    this.setData({
      index: index
    })
    wx.navigateTo({
      url: '/pages/songDetail/songDetail?musicId='+song.tracks[index].id
    })
    // console.log(event.currentTarget.id)
  },

  //获取排行榜下标
  getTopListIdex(event){
    let topListIndex=event.currentTarget.dataset;
    // console.log(topListIndex.toplistindex);
    //  console.log(typeof(topListIndex));
    this.setData({
      topListIndex:topListIndex.toplistindex
    })
    
  },
  //根据歌单Id跳转到歌单详情
  toPlayList(event){
    let rec=event.currentTarget.dataset;
    //console.log(rec)
    wx.navigateTo({
      url: '/pages/playlist/playlist?id='+rec.rec.id,
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