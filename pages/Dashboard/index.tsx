import { useEffect, useState, useRef, useContext } from "react";
import { useRouter } from "next/router";
import { Layout } from "@/components/layout";
import { createClient } from "@/lib/supabase/component";
import { SessionContext } from "@/lib/supabase/usercontext";
import ImageUpload from "@/components/img-upload";

export default function Dashboard() {
  const supabase = createClient();
  const session = useContext(SessionContext);
  const router = useRouter();
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserFirstName = async () => {
      if (!session?.user?.id) {
        setFirstName("User")
        return;
      }

      if (session.user.app_metadata.provider === "google") {
        const googleDisplayName = session.user.user_metadata?.full_name.split(' ')[0]; 
        if (googleDisplayName) {
          setFirstName(googleDisplayName);
          return;
        }
      } 

      else {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name")
          .eq("id", session.user.id)
          .single();
          if (error || !data) {
            console.warn("No profile found, using email prefix:", error?.message);
            setFirstName("User"); 
          } 
          else {
          setFirstName(data.first_name);
        }
      }
    };

    fetchUserFirstName();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.code) {
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [router.isReady, router.query.code]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-4xl font-bold mb-4">
          Welcome to the Dashboard, {firstName}!
        </h1>
        <ImageUpload />
      </div>
    </Layout>
  );
}