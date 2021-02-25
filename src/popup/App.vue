<template>
  <div class="container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="微博热搜" name="sina">
        <div class="top-list" v-for="(top,index) in sinaTops" :key=index>
          <el-row>
            <el-col :span="18"><span style="color: #409EFF">{{ top.id }}</span>&nbsp;&nbsp;<a :href="top.url" target="_blank">{{ top.title }}</a></el-col>
            <el-col :span="6">
              <el-tag id="hot-tag" effect="plain" type="info" @click="shareTops(index, 'sina')">热度:{{ top.nums }}</el-tag>
            </el-col>
          </el-row>
        </div>
        <div v-if="sinaTops.length === 0" style="text-align: center;">
          加载中...无反应请点击<a :href=api_config.sina_base_url target="_blank">此处</a>重试
        </div>
      </el-tab-pane>
      <!-- <el-tab-pane label="知乎热榜" >知乎</el-tab-pane> -->
      <el-tab-pane label="GitHub Trending" name="github">
        <div class="top-list">
          <el-select v-model="language" filterable placeholder="请选择语言">
            <el-option
                v-for="lang in languages"
                :key="lang"
                :label="lang"
                :value="lang">
            </el-option>
          </el-select>
          <el-select v-model="since" filterable placeholder="请选择日期范围" style="width: 150px;">
            <el-option
                v-for="item in dateRange"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
          </el-select>
          <el-button size="mini" round @click="setGithubConf">Save</el-button>
          <el-collapse v-model="activeItem" accordion>
            <el-collapse-item v-for="(top, index) in githubTops" :key="index" :name="index"
                              :disabled="top.desc === undefined">
              <template slot="title">
                <el-row style="width: 100%;">
                  <el-col :span="19">{{ top.id }}.&nbsp;&nbsp;<a :href="top.url" target="_blank">{{ top.title }}&nbsp;&nbsp;</a></el-col>
                  <el-col :span="5">
                    <el-tag effect="plain" type="info" @click="shareTops(index, 'github')"><i class="el-icon-star-off"></i>&nbsp;{{ top.stars }}
                    </el-tag>
                  </el-col>
                </el-row>
              </template>
              <div>
                {{ top.desc }}
                <el-tag effect="plain" type="info" @click="shareTops(index, 'github')"
                        v-if="top.lang">{{ top.lang }}
                </el-tag>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-tab-pane>
      <!--<el-tab-pane label="Settings">设置</el-tab-pane>-->
      <el-tab-pane label="About">
        <div>
          <el-divider content-position="left"><h3>介绍</h3></el-divider>
          <p style="font-weight: normal; line-height: 25px;">
            &nbsp;&nbsp;&nbsp;&nbsp;本插件主要整合微博热搜、GitHub实时榜单等数据，以列表形式展示，方便我们<strong>快速获取最新的消息 or 项目</strong>，使用<strong>"鼠标右键-固定"</strong>将本插件固定至标签栏食用效果更佳，后续也将不断地进行维护更新。
          </p>
          <el-divider content-position="left"><h3>反馈</h3></el-divider>
          <p style="font-weight: normal; line-height: 25px;">
            &nbsp;&nbsp;&nbsp;&nbsp;本项目已开源至<a href="https://github.com/zchengb/tops" target="_blank">GitHub</a>，如在使用过程中有任何异常或有建议，欢迎通过GitHub提交ISSUE或<a title="zchengb@163.com" href="mailto:zchengb@163.com">致信邮箱</a>联系作者。
          </p>
          <div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <el-button id="search-btn" icon="el-icon-refresh" :loading="loading"
               @click="getTops(activeName)" :disabled="searchState" circle></el-button>
    <el-backtop bottom="70" right="20" visibility-height="10"></el-backtop>
    <!--<div id="timer" class="timer">{{ nowTime }}</div>-->
  </div>
</template>

<script>
class Top {
  constructor() {
  }

  setId(id) {
    this.id = id;
    return this;
  }

  setTitle(title) {
    this.title = title;
    return this;
  }

  setUrl(url) {
    this.url = url;
    return this;
  }

  setNums(nums) {
    this.nums = nums;
    return this;
  }

  setDesc(desc) {
    this.desc = desc;
    return this;
  }

  setStars(stars) {
    this.stars = stars;
    return this;
  }

  setLang(lang) {
    this.lang = lang;
    return this;
  }
}

const TopType = {
  SINA: 'sina',
  ZHIHU: 'zhihu',
  GITHUB: 'github'
}

const log = chrome.extension.getBackgroundPage().console.log
export default {
  data() {
    return {
      languages: ["C++","Go","Java","JavaScript","Kotlin","Python","Vue","Unknown languages","1C Enterprise","4D","ABAP","ABNF","ActionScript","Ada","Adobe Font Metrics","Agda","AGS Script","AL","AL","Alloy","Alpine Abuild","Altium Designer", "AMPL","AngelScript","Ant Build System","ANTLR","ApacheConf","Apex","API Blueprint","APL","Apollo Guidance Computer","AppleScript","Arc","AsciiDoc","ASL","ASN.1","Classic ASP","ASP.NET","AspectJ","Assembly","Asymptote","ATS","Augeas","AutoHotkey","AutoIt","Avro IDL","Awk","Ballerina","Batchfile","Befunge","BibTeX","Bison","BitBake","Blade","BlitzBasic","BlitzMax","Bluespec","Boo","Brainfuck","Brightscript","Zeek","C","C#","C-ObjDump","C2hs Haskell","Cabal Config","Cap'n Proto","CartoCSS","Ceylon","Chapel","Charity","ChucK","Cirru","Clarion","Classic ASP","Clean","Click","CLIPS","Clojure","Closure Templates","Cloud Firestore Security Rules","CMake","COBOL","CodeQL","CoffeeScript","ColdFusion","ColdFusion CFC","COLLADA","Common Lisp","Common Workflow Language","Component Pascal","CoNLL-U","Cool","Coq","Cpp-ObjDump","Creole","Crystal","CSON","Csound","Csound Document","Csound Score","CSS","CSV","Cuda","cURL Config","CWeb","Cycript","Cython","D","D-ObjDump","Dafny","Darcs Patch","Dart","DataWeave","desktop","Dhall","Diff","DIGITAL Command Language","dircolors","DirectX 3D File","DM","DNS Zone","Dockerfile","Dogescript","DTrace","Dylan","E","Eagle","Easybuild","EBNF","eC","Ecere Projects","ECL","ECLiPSe","EditorConfig","Edje Data Collection","edn","Eiffel","EJS","Elixir","Elm","Emacs Lisp","EmberScript","EML","EQ","Erlang","F#","F*","Factor","Fancy","Fantom","Faust","FIGlet Font","Filebench WML","Filterscript","fish","FLUX","Formatted","Forth","Fortran","Fortran Free Form","FreeMarker","Frege","Futhark","G-code","Game Maker Language","GAML","GAMS","GAP","GCC Machine Description","GDB","GDScript","GEDCOM","Genie","Genshi","Gentoo Ebuild","Gentoo Eclass","Gerber Image","Gettext Catalog","Gherkin","Git Attributes","Git Config","GLSL","Glyph","Glyph Bitmap Distribution Format","GN","Gnuplot","Golo","Gosu","Grace","Gradle","Grammatical Framework","Graph Modeling Language","GraphQL","Graphviz (DOT)","Groovy","Groovy Server Pages","Hack","Haml","Handlebars","HAProxy","Harbour","Haskell","Haxe","HCL","HiveQL","HLSL","HolyC","HTML","HTML+Django","HTML+ECR","HTML+EEX","HTML+ERB","HTML+PHP","HTML+Razor","HTTP","HXML","Hy","HyPhy","IDL","Idris","Ignore List","IGOR Pro","Inform 7","INI","Inno Setup","Io","Ioke","IRC log","Isabelle","Isabelle ROOT","J","Jasmin","Java Properties","Java Server Pages","JavaScript+ERB","JFlex","Jison","Jison Lex","Jolie","JSON","JSON with Comments","JSON5","JSONiq","JSONLD","Jsonnet","JSX","Julia","Jupyter Notebook","Kaitai Struct","KiCad Layout","KiCad Legacy Layout","KiCad Schematic","Kit","KRL","LabVIEW","Lasso","Latte","Lean","Less","Lex","LFE","LilyPond","Limbo","Linker Script","Linux Kernel Module","Liquid","Literate Agda","Literate CoffeeScript","Literate Haskell","LiveScript","LLVM","Logos","Logtalk","LOLCODE","LookML","LoomScript","LSL","LTspice Symbol","Lua","M","M4","M4Sugar","Macaulay2","Makefile","Mako","Markdown","Marko","Mask","Mathematica","MATLAB","Maven POM","Max","MAXScript","mcfunction","MediaWiki","Mercury","Meson","Metal","Microsoft Developer Studio Project","MiniD","Mirah","mIRC Script","MLIR","Modelica","Modula-2","Modula-3","Module Management System","Monkey","Moocode","MoonScript","Motorola 68K Assembly","MQL4","MQL5","MTML","MUF","mupad","Muse","Myghty","nanorc","NASL","NCL","Nearley","Nemerle","nesC","NetLinx","NetLinx+ERB","NetLogo","NewLisp","Nextflow","Nginx","Nim","Ninja","Nit","Nix","NL","NPM Config","NSIS","Nu","NumPy","NWScript","ObjDump","Object Data Instance Notation","Objective-C","Objective-C++","Objective-J","ObjectScript","OCaml","Odin","Omgrofl","ooc","Opa","Opal","Open Policy Agent","OpenCL","OpenEdge ABL","OpenQASM","OpenRC runscript","OpenSCAD","OpenStep Property List","OpenType Feature File","Org","Ox","Oxygene","Oz","P4","Pan","Papyrus","Parrot","Parrot Assembly","Parrot Internal Representation","Pascal","Pawn","Pep8","Perl","PHP","Pic","Pickle","PicoLisp","PigLatin","Pike","PlantUML","PLpgSQL","PLSQL","Pod","Pod 6","PogoScript","Pony","PostCSS","PostScript","POV-Ray SDL","PowerBuilder","PowerShell","Prisma","Processing","Proguard","Prolog","Propeller Spin","Protocol Buffer","Public Key","Pug","Puppet","Pure Data","PureBasic","PureScript","Python console","Python traceback","q","Q#","QMake","QML","Qt Script","Quake","R","Racket","Ragel","Raku","RAML","Rascal","Raw token data","RDoc","Readline Config","REALbasic","Reason","Rebol","Red","Redcode","Regular Expression","Ren'Py","RenderScript","ReScript","reStructuredText","REXX","Rich Text Format","Ring","Riot","RMarkdown","RobotFramework","Roff","Roff Manpage","Rouge","RPC","RPM Spec","Ruby","RUNOFF","Rust","Sage","SaltStack","SAS","Sass","Scala","Scaml","Scheme","Scilab","SCSS","sed","Self","ShaderLab","Shell","ShellSession","Shen","Sieve","Slash","Slice","Slim","Smali","Smalltalk","Smarty","SmPL","SMT","Solidity","SourcePawn","SPARQL","Spline Font Database","SQF","SQL","SQLPL","Squirrel","SRecode Template","SSH Config","Stan","Standard ML","Starlark","Stata","STON","Stylus","SubRip Text","SugarSS","SuperCollider","Svelte","SVG","Swift","SWIG","SystemVerilog","Tcl","Tcsh","Tea","Terra","TeX","Texinfo","Text","Textile","Thrift","TI Program","TLA","TOML","TSQL","TSX","Turing","Turtle","Twig","TXL","Type Language","TypeScript","Unified Parallel C","Unity3D Asset","Unix Assembly","Uno","UnrealScript","UrWeb","V","Vala","VBA","VBScript","VCL","Verilog","VHDL","Vim Help File","Vim script","Vim Snippet","Visual Basic .NET","Visual Basic .NET","Volt","Wavefront Material","Wavefront Object","wdl","Web Ontology Language","WebAssembly","WebIDL","WebVTT","Wget Config","Windows Registry Entries","wisp","Wollok","World of Warcraft Addon Data","X BitMap","X Font Directory Index","X PixMap","X10","xBase","XC","XCompose","XML","XML Property List","Xojo","XPages","XProc","XQuery","XS","XSLT","Xtend","Yacc","YAML","YANG","YARA","YASnippet","ZAP","Zeek","ZenScript","Zephir","Zig","ZIL","Zimpl"],
      dateRange: [
        {value: 'daily', label: 'Today'},
        {value: 'weekly', label: 'This week'},
        {value: 'monthly', label: 'This month'}
      ],
      language: localStorage.getItem('topsGithubLang') || '',
      since: localStorage.getItem('topsGithubSince') || 'daily',
      activeName: TopType.SINA,
      activeItem: '0',
      searchState: false,
      loading: false,
      nowTime: '时间获取中:)...',
      times: 0,
      targetTimes: 10,
      api_config: {
        sina_domain: "https://s.weibo.com/",
        sina_base_url: "https://s.weibo.com/top/summary/",
        github_domain: "https://github.com/",
        github_base_url: "https://github.com/trending/",
        base_num: 50
      },
      searchConfig: {
        githubLang: '',
        githubDateRange: ''
      },
      sinaTops: [],
      githubTops: []
    };
  },
  methods: {
    getTimer() {
      const time = new Date();
      const hour = time.getHours();
      const min = time.getMinutes();
      const sec = time.getSeconds();
      this.nowTime = hour + (min < 10 ? ":0" : ":") + min + (sec < 10 ? ":0" : ":") + sec + (hour < 12 ? " AM" : " PM");
    },
    parseTopHtml(html, type) {
      let tops = []
      html = new DOMParser().parseFromString(html, 'text/html')
      if (type === TopType.SINA) {
        let elements = html.getElementsByClassName("td-02");
        for (let i = 1; i <= this.api_config.base_num; ++i) {
          let a = elements[i].querySelector("a");
          let span = elements[i].querySelector("span");
          tops.push(new Top().setId(i)
              .setTitle(a.textContent)
              .setUrl(this.api_config.sina_domain + (i !== 3 ? a.getAttribute("href") : a.getAttribute("href_to")))
              .setNums(this.formatNums(span.textContent)));
        }
      } else if (type === TopType.GITHUB) {
        let elements = html.getElementsByClassName("Box-row")
        for (let i = 0; i <= this.api_config.base_num && i < elements.length; ++i) {
          let a_href = elements[i].querySelector("h1.lh-condensed > a");
          let p_desc = elements[i].querySelector("p") || {textContent: undefined};
          let span_lang = elements[i].querySelector("div > span > span:last-child") || {textContent: undefined}
          let span_stars = elements[i].querySelector("div.f6.text-gray.mt-2 > a")
          tops.push(new Top().setId(i + 1)
              .setTitle(a_href.textContent.replace(/[\r\s\n]+/g, ""))
              .setUrl(this.api_config.github_domain + a_href.getAttribute("href"))
              .setDesc(p_desc.textContent)
              .setLang(span_lang.textContent)
              .setStars(span_stars.textContent.trim()))
        }
        log(this.language)
      }
      return tops;
    },
    formatNums(nums) {
      nums = (nums || 0).toString();
      let result = '';
      while (nums.length > 3) {
        result = ',' + nums.slice(-3) + result;
        nums = nums.slice(0, nums.length - 3);
      }
      if (nums) {
        result = nums + result;
      }
      return result;
    },
    getTops(type) {
      this.loading = true;
      if (type === TopType.SINA) {
        this.$axios.get(this.api_config.sina_base_url)
          .then((res) => {
            this.sinaTops = this.parseTopHtml(res.data, TopType.SINA)
            this.loading = false;
          })
      } else if (type === TopType.GITHUB) {
        this.$axios.get(this.api_config.github_base_url + this.language,{params: {since: this.since}})
          .then((res) => {
            this.githubTops = this.parseTopHtml(res.data, TopType.GITHUB)
            this.loading = false
          })
      }
      if (this.times !== 0 && this.times >= this.targetTimes) {
        this.$message("注意休息奥，你已经连续刷了" + this.times + "次了😈")
        this.targetTimes <<= 1;
      }
      this.times += 1;
    },
    shareTops(idx, type) {
      if (type === TopType.SINA) {
        this.$copyText("[微博热搜] " + this.sinaTops[idx].title + "\n链接：" + this.sinaTops[idx].url)
      } else if (type === TopType.GITHUB) {
        this.$copyText("[GitHub Trending] " + this.githubTops[idx].title + "\n链接：" + this.githubTops[idx].url)
      }
      this.$message({message: '分享链接已复制至剪切板😉~', duration: 500, type: 'success'})
    },
    handleClick(tab, event) {
      this.searchState = (tab.name === undefined);
    },
    setGithubConf() {
      localStorage.setItem('topsGithubSince', this.since);
      localStorage.setItem('topsGithubLang', this.language);
      this.getTops(TopType.GITHUB);
      this.$message({message: '保存成功😉~', duration: 500, type: 'success'})
    }
  },
  mounted() {
    this.getTops(TopType.SINA);
    this.getTops(TopType.GITHUB);
  }
};
</script>

<style>
#search-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 40px;
  height: 40px;
  z-index: 9999;
  color: #01709c;
  opacity: 0.8;
}

#search-btn:focus {
  background-color: unset;
}

#search-btn:hover {
  color: #01709c;
  border-color: #dcdfe6;
}

.el-backtop {
  color: #01709c;
  border: 1px solid #dcdfe6;
  box-shadow: none;
  opacity: 0.8;
}

.el-select {
  margin-bottom:10px;
  margin-right: 10px;
  width: 150px;
}

#hot-tag {
  font-family: "Microsoft YaHei", "Arial", serif;
  width: 100px;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
}

.el-tag {
  font-family: "Microsoft YaHei", "Arial", serif;
  font-size: 10px;
  font-weight: bold;
  cursor: pointer;
  text-align: center;
}

.el-tabs {
  font-family: Noto Sans Marchen,serif;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
}

.el-collapse-item__header {
  font-family: "Microsoft YaHei", "Arial", serif;
  font-size: 14px;
  /*font-weight: bold;*/
  height: 30px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.top-list {
  margin-left: 15px;
  margin-bottom: 4px;
}

.top-list a {
  color: #000;
  text-decoration: none;
}

.top-list .el-tag {
  color: #7b7b7b;
  border-color: #dadada;
}

.timer {
  font-size: 64px;
  font-weight: bolder;
  color: #ededef;
  position: fixed;
  top: 50%;
  left: 10%;
  z-index: -9999;
  transform: translate(0, -50%);
}

.container {
  padding: 0 10px 10px;
}
</style>
