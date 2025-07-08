import { useQuery } from "@tanstack/react-query";
import { ListTodo, CalendarDays, Timer, TrendingUp, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Task } from "@shared/schema";

export default function TaskHistory() {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const weeklyTasks = tasks.filter(task => {
    const taskDate = new Date(task.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return taskDate >= weekAgo;
  });

  const stats = {
    totalTasks: tasks.length,
    weeklyTasks: weeklyTasks.length,
    avgTime: "25분", // This would be calculated from actual timing data
    successRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">작업 히스토리</h2>
        <p className="text-gray-600">완료된 작업들을 확인하고 성과를 추적하세요.</p>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">총 작업 수</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTasks}</p>
              </div>
              <ListTodo className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">이번 주 생성</p>
                <p className="text-2xl font-bold text-gray-900">{stats.weeklyTasks}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">평균 작업 시간</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgTime}</p>
              </div>
              <Timer className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">성공률</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Task History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>완료된 작업</CardTitle>
            <Select defaultValue="all">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 기간</SelectItem>
                <SelectItem value="week">최근 1주</SelectItem>
                <SelectItem value="month">최근 1개월</SelectItem>
                <SelectItem value="quarter">최근 3개월</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">작업 히스토리가 없습니다.</p>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      task.status === 'completed' 
                        ? 'bg-accent' 
                        : task.status === 'approved'
                        ? 'bg-primary'
                        : task.status === 'review_pending'
                        ? 'bg-warning'
                        : 'bg-gray-400'
                    }`}>
                      {task.status === 'completed' ? (
                        <i className="fas fa-check text-white"></i>
                      ) : task.status === 'approved' ? (
                        <i className="fas fa-share-alt text-white"></i>
                      ) : task.status === 'review_pending' ? (
                        <i className="fas fa-clock text-white"></i>
                      ) : (
                        <i className="fas fa-cog text-white"></i>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{task.topic}</h4>
                      <p className="text-sm text-gray-500">
                        {task.status === 'completed' ? '완료' : 
                         task.status === 'approved' ? '배포 준비' :
                         task.status === 'review_pending' ? '검수 대기' : '처리 중'}: {' '}
                        {new Date(task.updatedAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {task.status === 'completed' ? '4개 플랫폼 발행' : '진행 중'}
                      </p>
                      {task.status === 'completed' && (
                        <p className="text-xs text-gray-500">조회수 1,250 • 좋아요 89</p>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-6">
                <Button variant="outline">
                  <i className="fas fa-chevron-down mr-2"></i>
                  더 보기
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
