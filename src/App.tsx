import { FormEvent, useMemo, useState } from 'react';

const TIERS = [
  { id: 'tier1', name: 'Tier 1', amount: 10000, rate: 0.05, description: '5% interest per week' },
  { id: 'tier2', name: 'Tier 2', amount: 20000, rate: 0.1, description: '10% interest per week' },
  { id: 'tier3', name: 'Tier 3', amount: 30000, rate: 0.2, description: '20% interest per week' },
] as const;

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);

const MAX_MEMBERS = 12;

type TierId = (typeof TIERS)[number]['id'];

type Member = {
  id: string;
  name: string;
  tierId: TierId;
  amount: number;
  weeklyInterest: number;
  startWeek: number;
};

const getTier = (tierId: TierId) => TIERS.find((tier) => tier.id === tierId)!;

function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [formState, setFormState] = useState({ name: '', tierId: 'tier1' as TierId, amount: `${TIERS[0].amount}` });
  const [error, setError] = useState('');

  const availableSlots = MAX_MEMBERS - members.length;

  const totals = useMemo(() => {
    const totalPrincipal = members.reduce((sum, member) => sum + member.amount, 0);
    const totalWithInterest = members.reduce((sum, member) => sum + computeProjectedTotal(member, currentWeek), 0);
    const totalWeeklyInterest = members.reduce((sum, member) => sum + member.weeklyInterest, 0);

    return { totalPrincipal, totalWithInterest, totalWeeklyInterest };
  }, [members, currentWeek]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    const trimmedName = formState.name.trim();
    const selectedTier = getTier(formState.tierId);
    const parsedAmount = Number(formState.amount);

    if (!trimmedName) {
      setError('Please enter the student name.');
      return;
    }

    if (Number.isNaN(parsedAmount)) {
      setError('Amount must be a number.');
      return;
    }

    if (parsedAmount !== selectedTier.amount) {
      setError(`Tier ${selectedTier.name} requires exactly ${formatCurrency(selectedTier.amount)}.`);
      return;
    }

    if (members.length >= MAX_MEMBERS) {
      setError('The group already has 12 members.');
      return;
    }

    const newMember: Member = {
      id: crypto.randomUUID(),
      name: trimmedName,
      tierId: selectedTier.id,
      amount: parsedAmount,
      weeklyInterest: parsedAmount * selectedTier.rate,
      startWeek: currentWeek,
    };

    setMembers((prev) => [...prev, newMember]);
    setFormState({ name: '', tierId: formState.tierId, amount: `${selectedTier.amount}` });
  };

  const handleTierChange = (tierId: TierId) => {
    const selectedTier = getTier(tierId);
    setFormState((prev) => ({ ...prev, tierId, amount: `${selectedTier.amount}` }));
  };

  const handleWithdraw = (memberId: string) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  };

  const advanceWeek = () => {
    setCurrentWeek((prev) => prev + 1);
  };

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">Play-to-Earn Savings Group</p>
          <h1>12 Students. 3 tiers. Weekly growth.</h1>
          <p className="lede">
            Track savings, simulate weekly returns and manage withdrawals.
          </p>
        </div>
        <div className="week-card">
          <div>
            <p className="muted">Current week</p>
            <h2>Week {currentWeek}</h2>
          </div>
          <button type="button" className="primary" onClick={advanceWeek}>
            Increment week
          </button>
        </div>
      </header>

      <section className="grid">
        <div className="card">
          <div className="card-header">
            <div>
              <p className="muted">Register student</p>
              <h3>Fill a slot ({availableSlots} open)</h3>
            </div>
            <div className="badge">Max 12 members</div>
          </div>
          <form className="form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Student name</span>
              <input
                type="text"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Your Name"
                required
              />
            </label>

            <label className="field">
              <span>Savings tier</span>
              <div className="tier-row">
                <select value={formState.tierId} onChange={(event) => handleTierChange(event.target.value as TierId)}>
                  {TIERS.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} — {formatCurrency(tier.amount)} ({tier.description})
                    </option>
                  ))}
                </select>
                <span className="chip">Fixed deposit</span>
              </div>
            </label>

            <label className="field">
              <span>Deposit amount</span>
              <input
                type="number"
                min={getTier(formState.tierId).amount}
                max={getTier(formState.tierId).amount}
                value={formState.amount}
                onChange={(event) => setFormState((prev) => ({ ...prev, amount: event.target.value }))}
                required
              />
              <p className="hint">Must match the fixed amount for the selected tier.</p>
            </label>

            {error ? <div className="error">{error}</div> : null}

            <button type="submit" className="primary" disabled={availableSlots === 0}>
              {availableSlots === 0 ? 'Group is full' : 'Add to group'}
            </button>
          </form>
        </div>

        <div className="card stats">
          <div className="stat">
            <p className="muted">Total contributed</p>
            <h2>{formatCurrency(totals.totalPrincipal)}</h2>
            <p className="subtext">Sum of all active deposits</p>
          </div>
          <div className="stat">
            <p className="muted">Weekly interest</p>
            <h2>{formatCurrency(totals.totalWeeklyInterest)}</h2>
            <p className="subtext">Aggregate interest earned every week</p>
          </div>
          <div className="stat">
            <p className="muted">Projected payout (week {currentWeek})</p>
            <h2>{formatCurrency(totals.totalWithInterest)}</h2>
            <p className="subtext">Principal + accrued interest for all members</p>
          </div>
        </div>
      </section>

      <section className="card members">
        <div className="card-header">
          <div>
            <p className="muted">Active members ({members.length}/{MAX_MEMBERS})</p>
            <h3>Dashboard & withdrawals</h3>
          </div>
        </div>

        {members.length === 0 ? (
          <p className="empty">No members yet. Add a student to start tracking.</p>
        ) : (
          <div className="table" role="table">
            <div className="table-row head" role="row">
              <span>Student</span>
              <span>Tier</span>
              <span>Deposit</span>
              <span>Weekly interest</span>
              <span>Projected payout</span>
              <span></span>
            </div>
            {members.map((member) => {
              const tier = getTier(member.tierId);
              const projectedTotal = computeProjectedTotal(member, currentWeek);
              return (
                <div className="table-row" role="row" key={member.id}>
                  <span>
                    <strong>{member.name}</strong>
                    <small className="muted">Joined week {member.startWeek}</small>
                  </span>
                  <span>
                    {tier.name}
                    <small className="muted">{tier.description}</small>
                  </span>
                  <span>{formatCurrency(member.amount)}</span>
                  <span>{formatCurrency(member.weeklyInterest)}</span>
                  <span>{formatCurrency(projectedTotal)}</span>
                  <span className="actions">
                    <button type="button" className="ghost" onClick={() => handleWithdraw(member.id)}>
                      Withdraw & remove
                    </button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

const computeProjectedTotal = (member: Member, currentWeek: number) => {
  const weeksActive = Math.max(1, currentWeek - member.startWeek + 1);
  return member.amount + member.weeklyInterest * weeksActive;
};

export default App;
