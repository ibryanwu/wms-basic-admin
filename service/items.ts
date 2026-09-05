//自定义查询  返回boolean类型
//searchFields.some(...) 用于检查 searchFields 数组中是否有至少一个字段（field）包含 inputValue
export const customFilterForSelect = (
  option: any,
  inputValue: any,
  showDropList: boolean = false,
) => {
  if (inputValue.length > 2) {
    const searchFields = [option.data.search];
    return searchFields.some((field) => {
      const keywords = inputValue.split('|');
      // 检查是否同时包含两个关键字

      const containsMutliKeywords = keywords.every((keyword: any) =>
        field
          .toLowerCase()
          .replace(/\s/g, '')
          .includes(keyword.toLowerCase().replace(/\s/g, '')),
      );

      return containsMutliKeywords;
    });
  }
  return showDropList; //禁止一上来就显示下拉
};
