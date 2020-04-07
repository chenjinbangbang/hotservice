// 实际生产系统中，不要公开此秘钥，必须使用适当的措施来保护这个秘钥，比如机密库，环境变量或配置服务
export const jwtConstants = {
  secret: 'secretKey',
  expiresIn: 60 * 60 * 24 // 有效期是1天（如12h,20min,60s）
}