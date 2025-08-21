import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getDashboardStats,
  getBlockchainTransactionStats,
} from "../../utils/apiAdmin";

const StatCard = ({ title, value, subtitle, className = "" }) => (
  <div className={`card ${className}`}>
    <div className="text-sm text-[var(--text-secondary)]">{title}</div>
    <div className="text-2xl font-semibold mt-1">{value}</div>
    {subtitle && (
      <div className="text-xs text-[var(--text-secondary)] mt-1">
        {subtitle}
      </div>
    )}
  </div>
);

const TransactionProgressBar = ({
  label,
  percentage,
  count,
  color = "blue",
}) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-2">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm text-[var(--text-secondary)]">
        {percentage}% ({count})
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className={`h-2.5 rounded-full transition-all duration-500 ${
          color === "blue"
            ? "bg-blue-600"
            : color === "green"
            ? "bg-green-600"
            : color === "purple"
            ? "bg-purple-600"
            : color === "orange"
            ? "bg-orange-600"
            : "bg-blue-600"
        }`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  </div>
);

const SimplePieChart = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="text-center">
      <h4 className="text-sm font-medium mb-3 text-[var(--text-secondary)]">
        {title}
      </h4>
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 32 32">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const angle = (percentage / 100) * 360;
            const x1 = 16 + 14 * Math.cos((currentAngle * Math.PI) / 180);
            const y1 = 16 + 14 * Math.sin((currentAngle * Math.PI) / 180);
            const x2 =
              16 + 14 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
            const y2 =
              16 + 14 * Math.sin(((currentAngle + angle) * Math.PI) / 180);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              `M 16 16`,
              `L ${x1} ${y1}`,
              `A 14 14 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              `Z`,
            ].join(" ");

            currentAngle += angle;

            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke="white"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold">{total.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-secondary)]">Total</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-center space-x-2"
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-xs text-[var(--text-secondary)]">
              {item.label}: {((item.value / total) * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BlockchainStatsCard = ({
  title,
  value,
  subtitle,
  icon,
  className = "",
}) => (
  <div className={`card ${className}`}>
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-[var(--text-secondary)]">{title}</div>
        <div className="text-2xl font-semibold mt-1">{value}</div>
        {subtitle && (
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            {subtitle}
          </div>
        )}
      </div>
      {icon && <div className="text-3xl text-blue-500">{icon}</div>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [blockchainStats, setBlockchainStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blockchainLoading, setBlockchainLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("estimated"); // "estimated" or "blockchain"

  useEffect(() => {
    (async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (e) {
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchBlockchainStats = async () => {
    setBlockchainLoading(true);
    try {
      const data = await getBlockchainTransactionStats();
      setBlockchainStats(data);
    } catch (e) {
      console.error("Failed to load blockchain stats:", e);
    } finally {
      setBlockchainLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === "blockchain" && !blockchainStats) {
      fetchBlockchainStats();
    }
  }, [viewMode]);

  if (loading) return <div className="card">Loading...</div>;
  if (error) return <div className="card text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {stats && (
        <>
          {/* Basic Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Employees"
              value={stats.statistics.totalEmployees}
              subtitle="Registered users"
            />
            <StatCard
              title="Organizations"
              value={stats.statistics.totalOrganizations}
              subtitle="Endorsing entities"
            />
            <StatCard
              title="Certificates"
              value={stats.statistics.totalCertificates}
              subtitle="Issued certificates"
            />
          </div>

          {/* Transaction Statistics Toggle */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">
                Blockchain Transaction Statistics
              </h2>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("estimated")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "estimated"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Estimated
                </button>
                <button
                  onClick={() => setViewMode("blockchain")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "blockchain"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Real-time
                </button>
              </div>
            </div>

            {viewMode === "estimated" ? (
              /* Estimated Transaction Statistics */
              <>
                {/* Overall Synthetic Transaction Percentage */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {stats.transactionStats.syntheticTransactionPercentage}%
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      of all blockchain interactions are synthetic transactions
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      Total: {stats.transactionStats.totalSyntheticTransactions}{" "}
                      synthetic transactions
                    </div>
                  </div>
                </div>

                {/* Transaction Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium text-[var(--text-secondary)]">
                    Transaction Breakdown
                  </h3>

                  {/* Pie Chart Visualization */}
                  <div className="mb-6">
                    <SimplePieChart
                      title="Transaction Distribution"
                      data={[
                        {
                          label: "Certificates",
                          value:
                            stats.transactionStats.breakdown
                              .certificateTransactions.count,
                          color: "#3B82F6",
                        },
                        {
                          label: "Profile Updates",
                          value:
                            stats.transactionStats.breakdown
                              .employeeProfileTransactions.count,
                          color: "#10B981",
                        },
                        {
                          label: "Endorsements",
                          value:
                            stats.transactionStats.breakdown
                              .endorsementTransactions.count,
                          color: "#8B5CF6",
                        },
                        {
                          label: "Registrations",
                          value:
                            stats.transactionStats.breakdown
                              .registrationTransactions.count,
                          color: "#F59E0B",
                        },
                      ]}
                    />
                  </div>

                  <TransactionProgressBar
                    label="Certificate Transactions"
                    percentage={
                      stats.transactionStats.breakdown.certificateTransactions
                        .percentage
                    }
                    count={
                      stats.transactionStats.breakdown.certificateTransactions
                        .count
                    }
                    color="blue"
                  />

                  <TransactionProgressBar
                    label="Employee Profile Updates"
                    percentage={
                      stats.transactionStats.breakdown
                        .employeeProfileTransactions.percentage
                    }
                    count={
                      stats.transactionStats.breakdown
                        .employeeProfileTransactions.count
                    }
                    color="green"
                  />

                  <TransactionProgressBar
                    label="Endorsement Transactions"
                    percentage={
                      stats.transactionStats.breakdown.endorsementTransactions
                        .percentage
                    }
                    count={
                      stats.transactionStats.breakdown.endorsementTransactions
                        .count
                    }
                    color="purple"
                  />

                  <TransactionProgressBar
                    label="User Registration"
                    percentage={
                      stats.transactionStats.breakdown.registrationTransactions
                        .percentage
                    }
                    count={
                      stats.transactionStats.breakdown.registrationTransactions
                        .count
                    }
                    color="orange"
                  />
                </div>

                {/* Transaction Summary */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-[var(--text-secondary)]">
                        Total Base Records:
                      </span>
                      <span className="ml-2 font-medium">
                        {stats.transactionStats.totalTransactions}
                      </span>
                    </div>
                    <div>
                      <span className="text-[var(--text-secondary)]">
                        Total Blockchain Interactions:
                      </span>
                      <span className="ml-2 font-medium">
                        {stats.transactionStats.totalSyntheticTransactions}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Real-time Blockchain Statistics */
              <>
                {blockchainLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-[var(--text-secondary)]">
                      Analyzing blockchain transactions...
                    </p>
                  </div>
                ) : blockchainStats ? (
                  <>
                    {/* Blockchain Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <BlockchainStatsCard
                        title="Total Transactions"
                        value={blockchainStats.blockchainStats.totalTransactions.toLocaleString()}
                        subtitle="Last 100 blocks"
                        icon="🔗"
                      />
                      <BlockchainStatsCard
                        title="Contract Interactions"
                        value={blockchainStats.blockchainStats.contractInteractions.toLocaleString()}
                        subtitle="Smart contract calls"
                        icon="📋"
                      />
                      <BlockchainStatsCard
                        title="Synthetic Percentage"
                        value={`${blockchainStats.blockchainStats.syntheticTransactionPercentage}%`}
                        subtitle="Contract vs regular transactions"
                        icon="📊"
                      />
                    </div>

                    {/* Blockchain Transaction Breakdown */}
                    <div className="space-y-4">
                      <h3 className="text-md font-medium text-[var(--text-secondary)]">
                        Contract Transaction Breakdown
                      </h3>

                      {/* Pie Chart Visualization */}
                      <div className="mb-6">
                        <SimplePieChart
                          title="Contract Transaction Distribution"
                          data={[
                            {
                              label: "Certificates",
                              value:
                                blockchainStats.blockchainStats.breakdown
                                  .certificateTransactions.count,
                              color: "#3B82F6",
                            },
                            {
                              label: "Employee Ops",
                              value:
                                blockchainStats.blockchainStats.breakdown
                                  .employeeTransactions.count,
                              color: "#10B981",
                            },
                            {
                              label: "Organization Ops",
                              value:
                                blockchainStats.blockchainStats.breakdown
                                  .organizationTransactions.count,
                              color: "#8B5CF6",
                            },
                          ]}
                        />
                      </div>

                      <TransactionProgressBar
                        label="Certificate Operations"
                        percentage={
                          blockchainStats.blockchainStats.breakdown
                            .certificateTransactions.percentage
                        }
                        count={
                          blockchainStats.blockchainStats.breakdown
                            .certificateTransactions.count
                        }
                        color="blue"
                      />

                      <TransactionProgressBar
                        label="Employee Operations"
                        percentage={
                          blockchainStats.blockchainStats.breakdown
                            .employeeTransactions.percentage
                        }
                        count={
                          blockchainStats.blockchainStats.breakdown
                            .employeeTransactions.count
                        }
                        color="green"
                      />

                      <TransactionProgressBar
                        label="Organization Operations"
                        percentage={
                          blockchainStats.blockchainStats.breakdown
                            .organizationTransactions.percentage
                        }
                        count={
                          blockchainStats.blockchainStats.breakdown
                            .organizationTransactions.count
                        }
                        color="purple"
                      />
                    </div>

                    {/* Blockchain Info */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-[var(--text-secondary)]">
                            Analyzed Blocks:
                          </span>
                          <span className="ml-2 font-medium">
                            {blockchainStats.blockchainStats.analyzedBlocks}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--text-secondary)]">
                            Current Block:
                          </span>
                          <span className="ml-2 font-medium">
                            {blockchainStats.blockchainStats.currentBlockNumber.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-center">
                      <button
                        onClick={fetchBlockchainStats}
                        className="btn btn-outline btn-sm"
                        disabled={blockchainLoading}
                      >
                        {blockchainLoading ? "Refreshing..." : "Refresh Data"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-[var(--text-secondary)] mb-4">
                      Click to analyze real blockchain transactions
                    </p>
                    <button
                      onClick={fetchBlockchainStats}
                      className="btn btn-primary"
                      disabled={blockchainLoading}
                    >
                      {blockchainLoading
                        ? "Analyzing..."
                        : "Analyze Blockchain"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick Links */}
          <div className="card">
            <h2 className="text-lg font-medium mb-3">Quick Links</h2>
            <div className="flex gap-3 flex-wrap">
              <Link to="/admin/register" className="btn btn-primary">
                Register User
              </Link>
              <Link to="/admin/employees" className="btn btn-outline">
                Employees
              </Link>
              <Link to="/admin/organizations" className="btn btn-outline">
                Organizations
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
