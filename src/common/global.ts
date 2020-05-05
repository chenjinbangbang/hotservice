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
 * 查询列表数据时，只保留某些数据
 * @param list 返回数据
 * @param params 保留的数据
 */
export function retainMany(list: Array<any> = [], params: string[] = []) {
  list.forEach((item) => {
    for (let key in item) {
      if (!params.includes(key)) {
        delete item[key];
      }
    }
  })
}

/**
 * 查询某个数据时，只保留某些数据
 * @param data 返回数据
 * @param params 保留的数据
 */
export function retainOne(data: Array<any> = [], params: string[] = []) {
  for (let key in data) {
    if (!params.includes(key)) {
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
export function searchParams(data: object, params: string[] = [], extras: string[] = []) {
  let searchData: any = {};

  // 需要处理的字段，检查是否有传入，没有传则赋值为'%%'
  for (let value of params) {
    if (data[value] === undefined || data[value] === null) {
      searchData[value] = '%%'
    }
  }

  // 传入的字段，检查是否是undefined或null，是则赋值为'%%'
  for (let key in data) {
    if (data[key] === undefined || data[key] === null) {
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