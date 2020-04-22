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
 * 使用getRawOne()方法时，删除所有原始数据
 * @param list 返回数据
 * @param alias 表别名
 * @param extra 额外不可返回的数据
 */
export function removeRawOne(data: object = {}, alias: string = '', extra: string[] = []) {
  for (let key in data) {
    if (key.includes(alias) || extra.includes(key)) {
      delete data[key];
    }
  }
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

/**
 * 用于模糊查询，处理需要进行模糊查询的字段
 * @param data 请求主体参数
 * @param params 需要处理的字段，不存在/null/undefined统一则赋值为'%%'
 * @param extras 不需要处理的字段
 */
export function searchParams(data: object, params: string[], extras: string[]) {
  let searchData: any = {};
  for (let key in data) {
    // for (let value of params) {
    //   c[value] = (value !== key || data[key] === undefined || data[key] === null) ? '%%' : data[key];
    // }
    // 判断是否存在，不存在则赋值为'%%'，存在则直接赋值
    if (!params.includes(key) || data[key] === undefined || data[key] === null) {
      searchData[key] = '%%'
    } else {
      searchData[key] = data[key]
    }


    if (!extras.includes(key)) {
      searchData[key] = `%${data[key]}%`;
    }
  }
  return searchData;
}