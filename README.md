# 💕 情侣旅行地图记录网站

一个融合"小丸子 + 哆啦A梦"可爱风格的情侣旅行记录网站，记录你们每一个甜蜜的足迹。

## ✨ 特色功能

- 🗺️ **交互式世界地图** - 基于 Leaflet.js 的流畅地图体验
- 💕 **可爱标记点** - 带有动画效果的emoji标记，点击查看详细故事
- 🌸 **小丸子风格UI** - 粉色、淡蓝、米白的温馨配色
- 🎭 **哆啦A梦元素** - 充满童趣和想象力的设计细节
- 📱 **移动端适配** - 完美支持手机和平板浏览
- ✨ **动画效果** - 标记渐入、爱心飘浮、云朵装饰等可爱动画
- 📊 **统计信息** - 显示旅行城市数、国家数和回忆数量

## 🚀 快速开始

### 1. 下载项目文件
```bash
git clone <your-repo-url>
cd travel_map
```

### 2. 编辑旅行数据
修改 `places.json` 文件，添加你们的旅行回忆：

```json
{
  "lat": 39.9042,
  "lng": 116.4074,
  "city": "北京",
  "country": "中国",
  "date": "2023年春天",
  "type": "culture",
  "story": "在故宫的红墙下，我们手牵手走过了每一个角落..."
}
```

### 3. 本地预览
使用任意HTTP服务器运行：

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve .

# PHP
php -S localhost:8000
```

然后访问 `http://localhost:8000`

## 📝 数据格式说明

`places.json` 文件中每个地点包含以下字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `lat` | Number | ✅ | 纬度坐标 |
| `lng` | Number | ✅ | 经度坐标 |
| `city` | String | ✅ | 城市名称 |
| `country` | String | ✅ | 国家名称 |
| `date` | String | ✅ | 旅行时间 |
| `story` | String | ✅ | 旅行故事描述 |
| `type` | String | ❌ | 地点类型，影响标记图标 |

### 地点类型 (type) 选项：
- `city` 🏙️ - 城市景观
- `beach` 🏖️ - 海滩度假
- `mountain` 🏔️ - 山景自然
- `food` 🍜 - 美食体验
- `culture` 🏛️ - 文化古迹
- `nature` 🌸 - 自然风光
- `adventure` 🎢 - 冒险活动
- `romantic` 💕 - 浪漫约会
- `default` 📍 - 默认标记

## 🎨 自定义样式

### 修改配色
在 `styles.css` 中调整CSS变量：

```css
:root {
  --primary-pink: #ff6b9d;
  --primary-blue: #4ecdc4;
  --primary-purple: #a8e6cf;
}
```

### 添加新的标记类型
在 `script.js` 的 `getMarkerEmoji` 函数中添加：

```javascript
const emojiMap = {
  'your-type': '🎯',
  // ... 其他类型
};
```

## 🌐 部署指南

### GitHub Pages
1. 将代码推送到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择主分支作为源
4. 访问 `https://yourusername.github.io/your-repo-name`

### Vercel
1. 连接GitHub仓库到Vercel
2. 自动部署，无需额外配置
3. 获得自定义域名

### Netlify
1. 拖拽文件夹到Netlify部署页面
2. 或连接GitHub仓库自动部署

## 🛠️ 技术栈

- **前端框架**: 纯HTML/CSS/JavaScript
- **地图库**: Leaflet.js
- **样式框架**: Tailwind CSS
- **字体**: Google Fonts (Noto Sans SC)
- **图标**: Emoji + 自定义CSS

## 📱 浏览器支持

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ iOS Safari 12+
- ✅ Android Chrome 60+

## 🎯 使用场景

- 💑 情侣旅行记录
- 👨‍👩‍👧‍👦 家庭旅行回忆
- 🎓 毕业旅行纪念
- 🏃‍♀️ 个人旅行日记
- 🎉 特殊纪念日记录

## 💡 创意扩展

- 添加照片上传功能
- 集成社交分享
- 添加旅行路线规划
- 支持视频回忆
- 添加天气信息
- 集成旅行预算记录

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

## 📄 许可证

MIT License - 自由使用和修改

---

💕 **愿这个小小的网站，记录下你们所有的甜蜜时光** 💕