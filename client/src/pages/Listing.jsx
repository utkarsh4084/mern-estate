import {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {Swiper, SwiperSlide} from 'swiper/react';
import SwiperCore from 'swiper';
import {Navigation} from 'swiper/modules';
import 'swiper/css/bundle';

export default function Listing() {
    SwiperCore.use([Navigation]);
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const params = useParams();
    useEffect(() => {
        const fetchListing = async () => {
            try {
                setLoading(true)
                const res = await fetch(`/api/listing/get/${params.listingId}`)
                const data = await res.json();
                setLoading(false)
                if(data.success === false) {
                    setError(true)
                    return;
                }
                setListing(data) 
            } catch(err) {
                setLoading(false)
                setError(true)
            }
        }      
        fetchListing();
    }, [params.listingId]);

    return (
        <main>
            {loading && <p className="text-center my-7 text-2xl">Loading ...</p>}
            {error && <p className="text-center my-7 text-2xl">{error}</p>}
            {listing && (
                <div>
                    <Swiper navigation>
                        {listing.imageUrls.map((url) => {
                            return (<SwiperSlide key={url}>
                                        <div className='h-[550px]' 
                                                style={{background:`url(${url}) center no-repeat`, 
                                                        backgroundSize: 'cover'}}>
                                        </div>
                                    </SwiperSlide>)
                        })}
                    </Swiper>
                </div>
            )}
        </main>
    )
}