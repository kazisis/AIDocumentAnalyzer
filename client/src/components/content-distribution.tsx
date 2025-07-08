import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, Copy, ExternalLink, Clock, SquareCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClipboard } from "@/hooks/use-clipboard";
import { useToast } from "@/hooks/use-toast";
import type { Task, Content } from "@shared/schema";

export default function ContentDistribution() {
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const { copyToClipboard } = useClipboard();
  const { toast } = useToast();

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: content = [] } = useQuery<Content[]>({
    queryKey: ["/api/tasks", selectedTaskId, "content"],
    enabled: !!selectedTaskId,
  });

  const readyTasks = tasks.filter(task => task.status === 'approved');
  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  const getContentByType = (type: string) => {
    return content.find(c => c.type === type);
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedTaskId(task.id);
  };

  const handleCopy = async (content: string, platform: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      toast({
        title: "복사 완료",
        description: `${platform} 콘텐츠가 클립보드에 복사되었습니다.`,
      });
    }
  };

  const handleCopyAll = async () => {
    const koreanBlog = getContentByType('korean_blog');
    const englishBlog = getContentByType('english_blog');
    const threads = getContentByType('threads');
    const tweets = getContentByType('twitter');

    let allContent = "";
    
    if (koreanBlog) {
      allContent += `=== 한글 블로그 ===\n${koreanBlog.title}\n\n${koreanBlog.content}\n\n`;
    }
    
    if (englishBlog) {
      allContent += `=== English Blog ===\n${englishBlog.title}\n\n${englishBlog.content}\n\n`;
    }
    
    if (threads) {
      const threadsData = JSON.parse(threads.content);
      allContent += `=== Threads ===\n${threadsData.join('\n\n')}\n\n`;
    }
    
    if (tweets) {
      const tweetsData = JSON.parse(tweets.content);
      allContent += `=== Twitter ===\n${tweetsData.join('\n\n')}\n\n`;
    }

    const success = await copyToClipboard(allContent);
    if (success) {
      toast({
        title: "전체 복사 완료",
        description: "모든 플랫폼의 콘텐츠가 클립보드에 복사되었습니다.",
      });
    }
  };

  const koreanBlog = getContentByType('korean_blog');
  const englishBlog = getContentByType('english_blog');
  const threads = getContentByType('threads');
  const tweets = getContentByType('twitter');

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">콘텐츠 배포 관리</h2>
        <p className="text-gray-600">생성된 콘텐츠를 각 플랫폼에 맞는 형태로 확인하고 배포하세요.</p>
      </div>

      {/* Content Package Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>배포 준비 완료된 콘텐츠</CardTitle>
        </CardHeader>
        <CardContent>
          {readyTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">배포 준비 완료된 콘텐츠가 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {readyTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskSelect(task)}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTaskId === task.id
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{task.topic}</h4>
                      <p className="text-sm text-gray-500">
                        파생 콘텐츠 생성됨: {new Date(task.updatedAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-accent text-white text-sm rounded-full">배포 준비</span>
                    <i className="fas fa-chevron-right text-primary"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Multi-Platform Distribution */}
      {selectedTask && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Korean Blog */}
            <Card>
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-blog text-primary text-lg"></i>
                    <CardTitle className="text-base">한글 블로그</CardTitle>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">마스터</span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {koreanBlog ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                      <h4 className="font-medium text-gray-900 mb-2">{koreanBlog.title}</h4>
                      <div 
                        className="text-sm text-gray-600"
                        dangerouslySetInnerHTML={{ 
                          __html: koreanBlog.content.substring(0, 300) + '...' 
                        }}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleCopy(koreanBlog.content, "한글 블로그")}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        복사
                      </Button>
                      <Button className="flex-1">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        발행
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">콘텐츠를 불러오는 중...</p>
                )}
              </CardContent>
            </Card>

            {/* English Blog */}
            <Card>
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fas fa-globe text-blue-500 text-lg"></i>
                    <CardTitle className="text-base">영문 블로그</CardTitle>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">파생</span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {englishBlog ? (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4 max-h-60 overflow-y-auto">
                      <h4 className="font-medium text-gray-900 mb-2">{englishBlog.title}</h4>
                      <div 
                        className="text-sm text-gray-600"
                        dangerouslySetInnerHTML={{ 
                          __html: englishBlog.content.substring(0, 300) + '...' 
                        }}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleCopy(englishBlog.content, "영문 블로그")}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        복사
                      </Button>
                      <Button className="flex-1">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        발행
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">콘텐츠를 불러오는 중...</p>
                )}
              </CardContent>
            </Card>

            {/* Threads */}
            <Card>
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fab fa-threads text-purple-500 text-lg"></i>
                    <CardTitle className="text-base">스레드</CardTitle>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    {threads ? `${JSON.parse(threads.content).length}개 포스트` : ''}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {threads ? (
                  <>
                    <div className="space-y-3 mb-4">
                      {JSON.parse(threads.content).map((post: string, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">[{index + 1}/{JSON.parse(threads.content).length}] {post}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleCopy(JSON.parse(threads.content).join('\n\n'), "스레드")}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        복사
                      </Button>
                      <Button className="flex-1">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        발행
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">콘텐츠를 불러오는 중...</p>
                )}
              </CardContent>
            </Card>

            {/* Twitter */}
            <Card>
              <CardHeader className="border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <i className="fab fa-x-twitter text-gray-800 text-lg"></i>
                    <CardTitle className="text-base">X (트위터)</CardTitle>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                    {tweets ? `${JSON.parse(tweets.content).length}개 트윗` : ''}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {tweets ? (
                  <>
                    <div className="space-y-3 mb-4">
                      {JSON.parse(tweets.content).map((tweet: string, index: number) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">{tweet}</p>
                          <span className="text-xs text-gray-500">{tweet.length}자</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleCopy(JSON.parse(tweets.content).join('\n\n'), "트위터")}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        복사
                      </Button>
                      <Button className="flex-1">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        발행
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">콘텐츠를 불러오는 중...</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Batch Actions */}
          <Card>
            <CardHeader>
              <CardTitle>일괄 배포 옵션</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" onClick={handleCopyAll}>
                    <Copy className="mr-2 h-4 w-4" />
                    전체 콘텐츠 복사
                  </Button>
                  <Button variant="outline">
                    <Clock className="mr-2 h-4 w-4" />
                    예약 발행 설정
                  </Button>
                </div>
                <Button className="bg-accent hover:bg-accent-light">
                  <SquareCheck className="mr-2 h-4 w-4" />
                  작업 완료 처리
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
