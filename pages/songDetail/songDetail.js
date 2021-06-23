// pages/songDetail/songDetail.js
import PubSub from 'pubsub-js'
import moment from 'moment'
import request from '../../utils/request'
//获取全局实例
const appInstance =getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      isPlay: false, //音乐是否播放
      song:{},       //歌曲详情对象
      musicId: '',   //音乐id
      musicLink: '', //音乐链接
      currentTime: '00:00', //当前时长
      durationTime: '00:00',//总时长
      currentWidth: 0, //实时进度条的宽度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //options: 用于接收路由跳转的query参数
    //原生小程序中路由传参，对参数的长度有限制，如果参数长度过长会自动截取掉
    //console.log(JSON.parse(options.song))

     let musicId =options.musicId;
    //console.log(options);
    //console.log(musicId);
    this.setData({
      musicId
    })
    //获取音乐详情
      // if(appInstance.globalData.musicId !== musicId){
      //   this.getMusicInfo(musicId);
      // }
      this.getMusicInfo(musicId);
    
    
    
    
    //判断当前页面音乐是否在播放
    if(appInstance.globalData.isMusicPlay && appInstance.globalData.musicId === musicId){
      this.setData({
        isPlay:true
      })
    }
    

    // //封装修改全局musicId
    // this.changeMusicId(musicId);
    //console.log("当前页面的Id"+musicId);
    //console.log('-------全局的音乐id：'+appInstance.globalData.musicId);
    //console.log('当前页面ID：'+musicId);
    //console.log('isMusicPlay:' + appInstance.globalData.isMusicPlay);
    //console.log('appInstance:'+appInstance.globalData.musicId);
    
     
    /**
     * 问题：如果用户操作系统控制音乐播放/暂停的按钮，页面不知道，导致页面显示是否播放的状态和真实的音乐播放状态不一致
     * 解决方案：
     *    1.通过控制音频的实例 backgroundAudioManager 去监视音乐播放/暂停/停止
     */
      this.backgroundAudioManager =wx.getBackgroundAudioManager();
      this.backgroundAudioManager.onPlay(()=>{
        //修改音乐是否播放的状态
        this.changePlayState(true);

        //修改全局musicId
        appInstance.globalData.musicId=musicId;
      });
      this.backgroundAudioManager.onPause(()=>{
         //修改音乐是否播放的状态
         this.changePlayState(false);
      });
      this.backgroundAudioManager.onStop(()=>{
        //修改音乐是否播放的状态
        this.changePlayState(false);
     });

     //监听音乐播放自然结束
     this.backgroundAudioManager.onEnded(()=>{
       //console.log('歌曲播放结束');
      //自动切换至下一首音乐，并且自动播放
      PubSub.subscribe('musicId',(msg,musicId) => {
        //获取新的音乐
        this.getMusicInfo(musicId);
        //自动播放
        this.musicControl(true,musicId);
        //关闭当前播放的音乐
        this.backgroundAudioManager.stop();
         
         //取消订阅
      PubSub.unsubscribe('musicId');
      
      })
      //发布消息数据给recommendSong页面
      PubSub.publish('switchType','next')
      //将实时进度条的长度还原成0，时间还原成0；
      this.setData({
        currentWidth:0,
        currentTime: '00:00'

      })
     });

     //监听音乐实时播放的进度
     this.backgroundAudioManager.onTimeUpdate(()=>{
      // console.log('总时长',this.backgroundAudioManager.duration);
      // console.log('实时的时长',this.backgroundAudioManager.currentTime);秒
      //格式化实时的播放时间
      let currentTime =moment(this.backgroundAudioManager.currentTime*1000).format('mm:ss');
      let currentWidth=(this.backgroundAudioManager.currentTime/this.backgroundAudioManager.duration)*450;
      this.setData({
        currentTime:currentTime,
        currentWidth:currentWidth
      })
     });
  },

  
    //封装修改播放状态的功能函数
    changePlayState(isPlay){
      this.setData({
        isPlay:isPlay
      })

      //修改全局播放状态
      appInstance.globalData.isMusicPlay=isPlay;
    },
    
    
    
   //请求歌曲信息
   async getMusicInfo(musicId){

    let songData =await request('/song/detail',{ids: musicId});
    
    //获取音乐的时长
    //songData.songs[0].dt 单位毫秒
    let durationTime =moment(songData.songs[0].dt).format('mm:ss');

    this.setData({
      song:songData.songs[0],
      durationTime
    })
    //自动播放
    this.musicControl(true,musicId);

    this.setData({
      musicId:musicId
    })

     //修改全局musicId
     appInstance.globalData.musicId=musicId;
     //console.log('封装修改全局musicId:' +appInstance.globalData.musicId);
     //修改音乐是否播放的状态
     this.changePlayState(true);
   //动态修改窗口标题
   wx.setNavigationBarTitle({
    title: this.data.song.name,
   })
    
},

  

  //点击播放暂停的回调
  handleMusicPlay(){
    let isPlay=!this.data.isPlay;
    // this.setData({
    //   isPlay
    // })
    let {musicId,musicLink} =this.data
    this.musicControl(isPlay,musicId,musicLink);
  },

  //控制音乐播放/暂停的功能函数
  async musicControl(isPlay,musicId,musicLink){
    
    if(isPlay){ //音乐播放
      if(!musicLink){
         //获取音频资源
          let musicLinkData =await request('/song/url',{id:musicId})
          musicLink = musicLinkData.data[0].url;

          this.setData({
            musicLink
          })

          
         
      }
      
      // backgroundAudioManager.src='音乐链接'
      this.backgroundAudioManager.src=musicLink
      this.backgroundAudioManager.title=this.data.song.name
    }else{ //暂停音乐
      this.backgroundAudioManager.pause();
    }

   
  },

  //点击切歌的回调
  handleSwitch(event){
    //获取切歌类型
    let type = event.currentTarget.id;

   
     //console.log(type)
    //关闭当前播放的音乐
    this.backgroundAudioManager.stop();
    //订阅来自recommendSong页面发布的musicId消息
    PubSub.subscribe('musicId',(msg,musicId) => {
      
      //获取新的音乐
      this.getMusicInfo(musicId);
      //自动播放
      this.musicControl(true,musicId);

       
       //修改全局musicId
       //appInstance.globalData.musicId=musicId;
       //console.log('点击切歌的回调:'+musicId)
      //  console.log('全局的音乐id：'+appInstance.globalData.musicId);
       //console.log('isMusicPlay:' + appInstance.globalData.isMusicPlay);
       
       //取消订阅
    PubSub.unsubscribe('musicId');
    
    })
   

    //发布消息数据给recommendSong页面
    PubSub.publish('switchType',type)
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