/**
 * 使用getRawMany()方法时，删除所有原始数据
 * @param list 返回数据
 * @param alias 表别名
 * @param extra 额外不可返回的数据
 */
export function removeRawMany(list: Array<any> = [], alias: string = '', extra: string[] = []) {
  list.forEach((item) => {
    for (let key in item) {
      if (key.includes(alias) || extra.includes(key)) {
        delete item[key];
      }
    }
  })
}

/**
 * 响应规范
 * @param success 成功失败
 * @param data 返回数据
 * @param msg 返回信息
 */
export function resFormat(success: boolean = true, data: any | null, msg: any | null) {
  return { success, data, msg };
}