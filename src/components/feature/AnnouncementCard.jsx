import Card from '../ui/Card.jsx';

const AnnouncementCard = ({ announcement }) => (
  <Card>
    <div className="flex items-center justify-between">
      <h4 className="text-base font-semibold">{announcement.title}</h4>
      <span className="text-xs uppercase text-gray-500">{announcement.publishAt}</span>
    </div>
    <p className="mt-2 text-sm text-gray-700">{announcement.body}</p>
  </Card>
);

export default AnnouncementCard;

// import AnnouncementCard from './AnnouncementCard.jsx';

// const AnnouncementsList = ({ announcements }) => {
//   return (
//     <div className="space-y-4">
//       {announcements.map((announcement) => (
//         <AnnouncementCard 
//           key={announcement._id || announcement.id} 
//           announcement={announcement} 
//         />
//       ))}
//     </div>
//   );
// };

// export default AnnouncementsList;

