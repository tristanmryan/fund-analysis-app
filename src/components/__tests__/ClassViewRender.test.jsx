import { render } from '@testing-library/react';
import BenchmarkRow from '../BenchmarkRow.jsx';
import { fmtPct, fmtNumber } from '../../utils/formatters';

const benchmark = { Symbol: 'IWF', 'Fund Name': 'Index', ytd: 1, oneYear: 2, threeYear: 3, fiveYear: 4, sharpe: 1, stdDev5y: 10, expense: 0.2 };
const fund = { Symbol: 'AAA', 'Fund Name': 'Fund A', ytd: null, oneYear: 5, threeYear: null, fiveYear: 7, sharpe: 0.8, stdDev5y: 12, expense: 0.3 };

test('class view table renders', () => {
  render(
    <table>
      <tbody>
        <BenchmarkRow data={benchmark} />
        <tr>
          <td>{fund.Symbol}</td>
          <td>{fund['Fund Name']}</td>
          <td>-</td>
          <td>{fmtPct(fund.ytd)}</td>
          <td>{fmtPct(fund.oneYear)}</td>
          <td>{fmtPct(fund.threeYear)}</td>
          <td>{fmtPct(fund.fiveYear)}</td>
          <td>{fmtNumber(fund.sharpe)}</td>
          <td>{fmtPct(fund.stdDev5y)}</td>
          <td>{fmtPct(fund.expense)}</td>
        </tr>
      </tbody>
    </table>
  );
});
