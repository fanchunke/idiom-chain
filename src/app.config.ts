export default defineAppConfig({
  pages: ["pages/index/index"],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "成语接龙",
    navigationBarTextStyle: "black",
  },
  lazyCodeLoading: "requiredComponents",
  subPackages: [
    {
      root: "pages/idiom",
      pages: ["idiom"],
    },
  ],
  entryPagePath: "pages/idiom/idiom",
});
