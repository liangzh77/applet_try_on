import { useLaunch } from '@tarojs/taro';
import Taro from '@tarojs/taro';
import './app.scss';

function App(props) {
  useLaunch(() => {
    console.log('App launched.');

    // 初始化云开发
    if (Taro.cloud) {
      Taro.cloud.init({
        env: 'cloudbase-5gyfvk8o3040075b', // 你的云开发环境ID
        traceUser: true
      });
      console.log('云开发初始化成功，环境ID: cloudbase-5gyfvk8o3040075b');
    } else {
      console.warn('当前环境不支持云开发');
    }
  });

  return props.children;
}

export default App;
