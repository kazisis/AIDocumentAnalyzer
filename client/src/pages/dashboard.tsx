import { useState } from "react";
import { Rocket, Bell, User } from "lucide-react";
import TaskCreation from "@/components/task-creation";
import ContentReview from "@/components/content-review";
import ContentDistribution from "@/components/content-distribution";
import TaskHistory from "@/components/task-history";
import ApiSettings from "@/components/api-settings";

type TabType = "create" | "review" | "distribute" | "history" | "settings";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>("settings");

  const tabs = [
    { id: "settings", label: "API 설정", icon: "fas fa-cog" },
    { id: "create", label: "작업 생성", icon: "fas fa-plus-circle" },
    { id: "review", label: "콘텐츠 검수", icon: "fas fa-edit" },
    { id: "distribute", label: "배포 관리", icon: "fas fa-share-alt" },
    { id: "history", label: "작업 히스토리", icon: "fas fa-history" },
  ] as const;

  return (
    <div className="min-h-screen bg-background font-noto-kr text-secondary">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Rocket className="text-primary text-2xl" />
                <h1 className="text-xl font-bold text-primary">Auto-Insight Engine</h1>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                콘텐츠 파이프라인 대시보드
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">사</span>
                </div>
                <span className="text-sm font-medium">사용자</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-surface border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "settings" && <ApiSettings />}
        {activeTab === "create" && <TaskCreation />}
        {activeTab === "review" && <ContentReview />}
        {activeTab === "distribute" && <ContentDistribution />}
        {activeTab === "history" && <TaskHistory />}
      </main>
    </div>
  );
}
