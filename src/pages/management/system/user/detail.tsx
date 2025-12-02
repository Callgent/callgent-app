import Card from "@/components/layouts/card";
import { useParams } from "@/router/hooks";

import type { UserInfo } from "@/types/entity";

const USERS: UserInfo[] = [] as UserInfo[];

export default function UserDetail() {
  const { id } = useParams();
  const user = USERS.find((user) => user.id === id);
  return (
    <Card>
      <p>这是用户{user?.name}的详情页面</p>
    </Card>
  );
}
