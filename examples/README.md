# 五份虚构示例

这里的数量全部是为了演示而编造，不代表任何店铺的真实库存或销量。示例假设销量覆盖完整 7 天，数量单位为台，不含订单、客户、金额或账号信息。

在文件页面选择下载原始文件，或使用下列“下载”链接保存。分别上传到工具对应的五个框，不要把五份文件放进同一个框。

| 文件 | 上传位置 | 预期数量 | 下载 |
| --- | --- | ---: | --- |
| [stock-mks.csv](stock-mks.csv) | 马卡萨仓库存 | 30 | [下载](https://casteen-code.github.io/realme-inventory-turnover/examples/stock-mks.csv) |
| [stock-pnk.csv](stock-pnk.csv) | 坤甸仓库存 | 20 | [下载](https://casteen-code.github.io/realme-inventory-turnover/examples/stock-pnk.csv) |
| [stock-bali.csv](stock-bali.csv) | 巴厘岛仓库存 | 35 | [下载](https://casteen-code.github.io/realme-inventory-turnover/examples/stock-bali.csv) |
| [sales-shopee.csv](sales-shopee.csv) | Shopee 分店销量 | 20 | [下载](https://casteen-code.github.io/realme-inventory-turnover/examples/sales-shopee.csv) |
| [sales-tiktok.csv](sales-tiktok.csv) | TikTok Shop 销量 | 11 | [下载](https://casteen-code.github.io/realme-inventory-turnover/examples/sales-tiktok.csv) |

首次在没有自定义规则的浏览器中计算，预期为：库存 **85**、周销量 **31**、整体周转 **19.2 天**，库存识别异常和销售待确认均为 **0**。两张结果表各有三款商品，合计行不应作为商品出现。

| 型号 | 可用库存 | 周销量 | 周转天数 |
| --- | ---: | ---: | ---: |
| C100i | 30 | 10 | 21.0 |
| P4x | 40 | 14 | 20.0 |
| Note 80 | 15 | 7 | 15.0 |

三款 SKU 分别是 C100i 4/128GB Dawn Purple、P4x 6/128GB Rally White、Note 80 4/64GB Glacier Blue。库存与销量故意采用不同文字顺序，以演示型号、内存和颜色标准化。

各店周销量应为：1 店 3、2 店 6、3 店 4、4 店 3、5 店 4、TikTok 11。按仓查看，巴厘岛销量 18、坤甸销量 3、马卡萨销量 10。

表中的总计只用于人工核对。程序应排除总计行和 Shopee 的合计列，不能重复计入。若你已保存过针对这些示例 SKU 的自定义规则，结果可能受规则影响；建议使用独立浏览器资料体验，不要清除工作浏览器的历史数据。
