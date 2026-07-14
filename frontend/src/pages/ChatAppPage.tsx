import Logout from '@/components/auth/Logout.tsx';
import { Button } from '@/components/ui/button';
import api from '@/lib/axios';
import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

export const ChatAppPage = () => {
  const user = useAuthStore((s) => s.user);

  const handleOnclick = async () => {
    try {
      await api.get('/users/test', { withCredentials: true });
      toast.success('ok');
    } catch (error) {
      toast.error('thất bại');
      console.error(error);
    }
  };
  return (
    <div>
      {user?.displayName}
      <Logout />
      <Button onClick={handleOnclick}>test</Button>
    </div>
  );
};
