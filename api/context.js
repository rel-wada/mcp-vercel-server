import { createMcpHandler } from '@vercel/mcp-adapter';
import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
function loadJson(filename) {
    const filepath = join(process.cwd(), 'resources', filename);
    return JSON.parse(readFileSync(filepath, 'utf-8'));
}
export default createMcpHandler((server) => {
    // 売上取得
    server.registerTool('get_sales_data', {
        description: '営業担当者の売上を返します',
        inputSchema: {
            person: z.string().optional().describe('営業担当者の名前（省略可）'),
        },
    }, async ({ person }) => {
        const data = loadJson('uriage.json');
        if (!person) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `全体の売上です\n対象月: ${data.対象月}\n営業: ${Object.keys(data.売上履歴).join(', ')}`,
                    },
                ],
            };
        }
        const p = data.売上履歴?.[person];
        if (!p) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `${person} の売上データは存在しません。`,
                    },
                ],
            };
        }
        return {
            content: [
                {
                    type: 'text',
                    text: `【${person}の売上】
対象月: ${data.対象月}
売上金額: ${p.売上金額.toLocaleString()}円
契約件数: ${p.契約件数}
取引先: ${p.主要取引先.join(', ')}`,
                },
            ],
        };
    });
    // 勤怠取得
    server.registerTool('get_attendance_data', {
        description: '指定した年月・従業員の勤怠データを返します',
        inputSchema: {
            yearMonth: z.string().optional().describe('年月（例: 202507）'),
            employeeId: z.string().optional().describe('従業員ID（任意）'),
        },
    }, async ({ yearMonth, employeeId, }) => {
        return {
            content: [
                {
                    type: 'text',
                    text: `勤怠データ取得\n年月: ${yearMonth || '未指定'}\n従業員ID: ${employeeId || '全体'}`,
                },
            ],
        };
    });
});
