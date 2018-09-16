<template>
  <div id="wrapper">
    <el-row :gutter="20" type="flex" justify="center">
      <el-col :span="6">
        <div class="grid-content bg-purple-light">
          <el-button type="primary" @click="concat" :disabled="concatting">主要按钮</el-button>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="grid-content bg-purple">
          <el-progress :percentage="percent"></el-progress>
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20">
      <el-col :span="12">
        <div class="drop" @dragover="allowDrop" @drop="dropFirst">拖动文件到这里</div>
        <el-table :data="firstFiles">
          <el-table-column label="第一个文件">
            <el-table-column type="index"></el-table-column>
            <el-table-column property="name" label="文件名"></el-table-column>
            <el-table-column property="size" label="大小"></el-table-column>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="12">
        <div class="drop" @dragover="allowDrop" @drop="dropSecond">拖动文件到这里</div>
        <el-table :data="secondFiles">
          <el-table-column label="第二个文件">
            <el-table-column type="index"></el-table-column>
            <el-table-column property="name" label="文件名"></el-table-column>
            <el-table-column property="size" label="大小"></el-table-column>
          </el-table-column>
        </el-table>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const {ipcRenderer} = require('electron')
  export default {
    data(){
      return {
        firstFiles: [],
        secondFiles: [],
        percent: 0,
        concatting: false,
      }
    },
    methods: {
      getFiles(ev){
        ev.preventDefault()
        let file_paths = []
        if(ev.dataTransfer.items && ev.dataTransfer.items[0].kind === "file"){
          var items = ev.dataTransfer.items;
          for (var i=0; i<items.length; i++) {
            var file = items[i].getAsFile()
            file_paths.push({name:file.path})
          }
        }
        else if(ev.dataTransfer.files.length > 0){
          var files = ev.dataTransfer.files
          for(let file of files){
            file_paths.push({name:file.path})
          }
        }
        else{
          return
        }
        return file_paths
      },
      dropFirst(ev){
        this.firstFiles = this.getFiles(ev) || []
        console.log(this.firstFiles)
      },
      dropSecond(ev){
        this.secondFiles = this.getFiles(ev) || []
        console.log(this.secondFiles)
      },
      allowDrop(ev){
        ev.preventDefault()
      },
      concat(){
        this.percent = 0
        this.concatting = true
        let f = [], s = []
        for(let file of this.firstFiles){
          f.push(file.name)
        }
        for(let file of this.secondFiles){
          s.push(file.name)
        }
        ipcRenderer.send('concat', f, s)
      }
    },
    mounted(){
      var that = this
      ipcRenderer.on('progress', (ev, percent)=>{
        that.percent = percent
        if(percent === 100){
          that.concatting = false
        }
      })
      ipcRenderer.on('msg', (ev, msg)=>{
        console.log(msg)
      })
    }
  }
</script>

<style>
.drop{
  background: #AAA;
  width: 100%;
  height: 50px;
  text-align: center;
  line-height: 50px;
}
.el-row{
  margin-bottom: 20px;
}
.el-row:last-child{
  margin-bottom: 0;
}
</style>
