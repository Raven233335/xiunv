export const Schema = z.object({
  世界: z
    .object({
      当前日期: z.string().prefault('亚特历 147 年 6 月 12 日'),
      当前时间: z.string().prefault('08:30'),
      当前地点: z.string().prefault('驻扎地'),
      当前淫雾浓度: z.coerce.number().prefault(5).transform(v => _.clamp(v, 1, 20)),
    })
    .prefault({}),

  队伍状态: z
    .object({
      食物量: z.coerce.number().prefault(120).transform(v => _.clamp(v, 0, 200)),
      淫魔精液总存量: z.coerce.number().prefault(80).transform(v => _.clamp(v, 0, 500)),
    })
    .prefault({}),

  队伍人员: z
    .record(
      z.string().describe('队员姓名'),
      z.object({
        年龄: z.coerce.number().prefault(30).transform(v => _.max([0, v])),
        性别: z.enum(['男', '女']).prefault('男'),
        外貌: z.string().prefault(''),
        背景: z.string().prefault(''),
        浊化表现: z.string().prefault(''),
        压力值: z.coerce.number().prefault(0).transform(v => _.clamp(v, 0, 100)),
        精液存量: z.coerce.number().prefault(0).transform(v => _.max([0, v])),
        生命值: z.coerce.number().prefault(100).transform(v => _.clamp(v, 0, 100)),
        浊化等级: z.coerce.number().prefault(0).transform(v => _.clamp(v, 0, 5)),
      }),
    )
    .prefault({}),

  修女: z
    .record(
      z.string().describe('修女姓名'),
      z.object({
        外貌: z.string().prefault(''),
        背景: z.string().prefault(''),
        年龄: z.coerce.number().prefault(18).transform(v => _.max([0, v])),
        性别: z.literal('女').prefault('女'),
        淫魔精液量: z.coerce.number().prefault(0).transform(v => _.clamp(v, 0, 100)),
        机芯等级: z.coerce.number().prefault(1).transform(v => _.clamp(v, 0, 5)),
        身体耐受值: z.coerce.number().prefault(100).transform(v => _.clamp(v, 0, 100)),
        淫匣: z
          .object({
            名字: z.string().prefault(''),
            机芯形态: z.string().prefault(''),
            外表描述: z.string().prefault(''),
          })
          .prefault({ 名字: '', 机芯形态: '', 外表描述: '' }),
      }),
    )
    .prefault({}),

  招募池: z
    .object({
      队员: z
        .record(
          z.string().describe('姓名'),
          z.object({
            外貌: z.string().prefault(''),
            背景: z.string().prefault(''),
            浊化表现: z.string().prefault(''),
            年龄: z.coerce.number().prefault(18),
            性别: z.string().prefault('未知'),
            浊化等级: z.coerce.number().prefault(0).transform(v => _.clamp(v, 0, 5)),
          }),
        )
        .prefault({}),
      修女: z
        .record(
          z.string().describe('姓名'),
          z.object({
            外貌: z.string().prefault(''),
            背景: z.string().prefault(''),
            年龄: z.coerce.number().prefault(18),
            性别: z.string().prefault('女'),
            机芯等级: z.coerce.number().prefault(1).transform(v => _.clamp(v, 0, 5)),
            淫匣: z
              .object({
                名字: z.string().prefault(''),
                机芯形态: z.string().prefault(''),
                外表描述: z.string().prefault(''),
              })
              .prefault({ 名字: '', 机芯形态: '', 外表描述: '' }),
          }),
        )
        .prefault({}),
    })
    .prefault({}),
});
export type Schema = z.output<typeof Schema>;
