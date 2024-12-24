import React, { useState, useEffect } from "react";
import Taro from "@tarojs/taro";
import { ConfigProvider, Loading, Overlay } from "@nutui/nutui-react-taro";
import "./index.scss";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      Taro.navigateTo({
        url: "/pages/idiom/idiom", // 目标页面的路径
      });
    }, 500); // 延迟 1 秒

    return () => clearTimeout(timer); // 清除定时器
  }, []);

  return (
    <ConfigProvider>
      <Overlay
        visible={isLoading}
        style={{ backgroundColor: "rgba(0, 0, 0, .4)" }}
      >
        <div className="home">
          <Loading direction="vertical" className="content">
            加载中
          </Loading>
        </div>
      </Overlay>
    </ConfigProvider>
  );
}
