import React, { useState, useEffect } from "react";
import { View, Text } from "@tarojs/components";
import {
  Button,
  Input,
  Toast,
  Divider,
  Tag,
  Collapse,
  ConfigProvider,
  Loading,
  Overlay,
} from "@nutui/nutui-react-taro";
import { idiomService } from "../../services/idiomService";
import "./idiom.scss";
import { ArrowDown } from "@nutui/icons-react-taro";

interface Idiom {
  derivation: string;
  explanation: string;
  pinyin: string;
  word: string;
  first: string;
  last: string;
}

export default function Index() {
  const [currentIdiom, setCurrentIdiom] = useState<Idiom | null>(null);
  const [nextIdioms, setNextIdioms] = useState<Idiom[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<Idiom[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const limit = 10;

  useEffect(() => {
    const initializeService = async () => {
      try {
        await idiomService.initialize(
          "https://oss.fanchunke.work/idioms.csv.gz"
        );
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize idiom service:", error);
        showToastMessage("加载成语数据失败，请重试");
      }
    };
    initializeService();
  }, []);

  useEffect(() => {
    if (inputValue.trim()) {
      const newSuggestions = idiomService.getSuggestions(inputValue.trim());
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue]);

  const handleSubmit = () => {
    if (!inputValue.trim()) {
      showToastMessage("请输入成语");
      return;
    }

    const idiom = idiomService.getIdiom(inputValue.trim());
    if (idiom) {
      setCurrentIdiom(idiom);
      const nextIdioms = idiomService.getNextIdioms(idiom, limit, history);
      setNextIdioms(nextIdioms);
      setInputValue("");
      setHistory((prev) => [idiom.word, ...prev]);
      setSuggestions([]);
    } else {
      showToastMessage("未找到该成语，请重试");
    }
  };

  const handleSuggestionClick = (idiom: Idiom) => {
    setCurrentIdiom(idiom);
    const nextIdioms = idiomService.getNextIdioms(idiom, limit, history);
    setNextIdioms(nextIdioms);
    setInputValue("");
    setHistory((prev) => [idiom.word, ...prev]);
    setSuggestions([]);
  };

  const handleChildClick = (word: string) => {
    const idiom = idiomService.getIdiom(word);
    if (idiom) {
      setCurrentIdiom(idiom);
      const nextIdioms = idiomService.getNextIdioms(idiom, limit, history);
      setNextIdioms(nextIdioms);
      setHistory((prev) => [word, ...prev]);
    }
  };

  const showToastMessage = (message: string) => {
    setToastMsg(message);
    setShowToast(true);
  };

  const WrapperStyle = {
    display: "flex",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  };

  const contentStyle = {
    display: "flex",
    width: "150px",
    height: "150px",
    background: "#fff",
    borderRadius: "8px",
    alignItems: "center",
    justifyContent: "center",
    color: "red",
  };

  if (isLoading) {
    return (
      <ConfigProvider>
        <Overlay
          visible={isLoading}
          style={{ backgroundColor: "rgba(0, 0, 0, .4)" }}
        >
          <div style={WrapperStyle}>
            <Loading direction="vertical" style={contentStyle}>
              加载中
            </Loading>
          </div>
        </Overlay>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider theme={{ nutuiLoadingIconColor: "#fa2c19" }}>
      <View className="index">
        <View className="search-box section">
          <View className="input-wrapper">
            <Input
              className="search-input"
              placeholder="请输入成语"
              value={inputValue}
              onChange={(value) => setInputValue(value)}
            />
            <Button
              type="primary"
              className="submit-button"
              onClick={handleSubmit}
            >
              提交
            </Button>
          </View>
          {suggestions.length > 0 && (
            <View className="suggestions-container">
              <View className="suggestions">
                {suggestions.map((idiom, index) => (
                  <View
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(idiom)}
                  >
                    <Text className="suggestion-word">{idiom.word}</Text>
                    <Text className="suggestion-pinyin">{idiom.pinyin}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {currentIdiom && (
          <View className="idiom-display section">
            <View className="current-idiom">
              <Text className="idiom-word">{currentIdiom.word}</Text>
              <Text className="idiom-pinyin">{currentIdiom.pinyin}</Text>
            </View>
            <Collapse defaultActiveName={["1", "2"]} expandIcon={<ArrowDown />}>
              <Collapse.Item title="释义" name="1" className="collapse-item">
                <Text>{currentIdiom.explanation}</Text>
              </Collapse.Item>
              <Collapse.Item title="出处" name="2" className="collapse-item">
                <Text>{currentIdiom.derivation}</Text>
              </Collapse.Item>
            </Collapse>
          </View>
        )}

        {nextIdioms.length > 0 && (
          <View className="next-idioms section">
            <Divider>可接龙成语</Divider>
            <View className="idiom-children">
              {nextIdioms.map((idiom, index) => (
                <View
                  key={index}
                  className="idiom-child"
                  onClick={() => handleChildClick(idiom.word)}
                >
                  {idiom.word}
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="history section">
          <Divider>历史记录</Divider>
          <View className="history-list">
            {history.map((word, index) => (
              <Tag
                key={index}
                className="history-item"
                onClick={() => setInputValue(word)}
              >
                {word}
              </Tag>
            ))}
          </View>
        </View>

        <Toast
          msg={toastMsg}
          visible={showToast}
          type="text"
          onClose={() => setShowToast(false)}
        />
      </View>
    </ConfigProvider>
  );
}
