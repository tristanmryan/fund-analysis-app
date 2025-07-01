import { render } from '@testing-library/react';
import BenchmarkRow from '@/components/BenchmarkRow.jsx';
import { fmtPct, fmtNumber } from '@/utils/formatters';

const benchmark = { Symbol: 'IWF', fundName: 'Index', ytd: 1, oneYear: 2, threeYear: 3, fiveYear: 4, sharpe3Y: 1, stdDev5Y: 10, expenseRatio: 0.2 };
const fund = { Symbol: 'AAA', fundName: 'Fund A', ytd: null, oneYear: 5, threeYear: null, fiveYear: 7, sharpe3Y: 0.8, stdDev5Y: 12, expenseRatio: 0.3 };

test('class view table renders', () => {
  render(
    <div>
      <BenchmarkRow data={benchmark} />
      <table>
        <tbody>
          <tr>
            <td>{fund.Symbol}</td>
            <td>{fund.fundName}</td>
            <td>-</td>
            <td>{fmtPct(fund.ytd)}</td>
            <td>{fmtPct(fund.oneYear)}</td>
            <td>{fmtPct(fund.threeYear)}</td>
            <td>{fmtPct(fund.fiveYear)}</td>
            <td>{fmtNumber(fund.sharpe3Y)}</td>
            <td>{fmtPct(fund.stdDev5Y)}</td>
            <td>{fmtPct(fund.expenseRatio)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
});
