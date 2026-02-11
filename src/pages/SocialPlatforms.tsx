// Alternative: Modern Minimal Version
import { FaYoutube, FaInstagram, FaSpotify, FaFacebook, 
         FaLinkedin, FaTwitter, FaAmazon } from 'react-icons/fa';
import { SiAudiomack,SiAmazon  } from 'react-icons/si';
const SocialPlatforms = () => {
    const platforms = [
    {
      name: "YouTube",
      description: "Follow & watch content",
      url: "https://youtube.com",
      icon: FaYoutube,
      color: "#FF0000"
    },
    {
      name: "Instagram",
      description: "Follow & share photos",
      url: "https://instagram.com",
      icon: FaInstagram,
      color: "#E4405F"
    },
    {
      name: "Spotify",
      description: "Listen & enjoy music",
      url: "https://spotify.com",
      icon: FaSpotify,
      color: "#1DB954"
    },
    {
      name: "Facebook",
      description: "Connect & follow updates",
      url: "https://facebook.com",
      icon: FaFacebook,
      color: "#1877F2"
    },
    {
      name: "LinkedIn",
      description: "Professional networking",
      url: "https://linkedin.com",
      icon: FaLinkedin,
      color: "#0A66C2"
    },
    {
      name: "Twitter",
      description: "Follow & tweet updates",
      url: "https://twitter.com",
      icon: FaTwitter,
      color: "#1DA1F2"
    },
    {
      name: "AudioMack",
      description: "Stream & enjoy music",
      url: "https://audiomack.com",
      icon: SiAudiomack,
      color: "#FFA200"
    },
    {
      name: "Amazon Music",
      description: "Listen & buy music",
      url: "https://music.amazon.com",
      icon: FaAmazon,
      color: "#FF9900"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <div className="text-center mb-16">
        <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wider">
          Social Platforms
        </span>
        <h2 className="text-4xl font-bold text-gray-900 mt-2 mb-4">
          Follow Our Journey
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Stay connected with us across all major platforms
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {platforms.map((platform) => {
          const IconComponent = platform.icon;
          return (
            <div
              key={platform.name}
              onClick={() => window.open(platform.url, '_blank')}
              className="group flex flex-col items-center p-6 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className={`p-4 rounded-full ${platform.bgLight} group-hover:scale-110 transition-transform duration-300 mb-4`}>
                <IconComponent className="w-8 h-8" style={{ color: platform.color }} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{platform.name}</h3>
              <p className="text-xs text-gray-500 text-center">{platform.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default SocialPlatforms;