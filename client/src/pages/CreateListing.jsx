import React from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useSelector } from 'react-redux'
import { app } from '../firebase.js';
import { useNavigate } from 'react-router-dom';

export default function CreateListing() {
    const { currentUser } = useSelector(state => state.user)
    const navigate = useNavigate();
    
    const [files, setFiles] = React.useState([]);
    const [formData, setFormData] = React.useState({
        imageUrls: [],
        name: '',
        description: '',
        address: '',
        type: 'rent',
        bedrooms: 1,
        bathrooms: 1,
        regularPrice: 50,
        discountPrice: 0,
        offer: false,
        parking: false,
        furnished: false,
    });
    const [imageUploadError, setImageUploadError] = React.useState(null);
    const [uploading, setUploading] = React.useState(false)
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(false);

       
    const handleImageSubmit = (e) => {
        if(files.length > 0 && files.length + formData.imageUrls.length < 7) {
            const promises = [];
            setUploading(true)
            setImageUploadError(false);

            for(let i = 0; i < files.length; i++) {
                promises.push(storeImage(files[i]))
            }

            Promise.all(promises).then((urls) => {
                setFormData({...formData, imageUrls: formData.imageUrls.concat(urls)});
                setImageUploadError(false)   
                setUploading(false)             
            }).catch((error) => {
                setImageUploadError('Image upload failed (2 mb max per image)')
                setUploading(false)  
            }) ;                      
        } else {
            setImageUploadError('You can upload only 6 images per listing')
        }

    }

    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getTime() + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file)
            uploadTask.on("state_changed", 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload in progress: ${progress} % done`)
            },
            (error) => {reject(error)},
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
                    resolve(downloadUrl)
                })
            })
        });
    }

    const handleRemoveImage = (index) => {
        setFormData({
            ...formData, imageUrls: formData.imageUrls.filter((url, i) => i !== index)
        })
    }

    const handleChange = (e) => {
        if(e.target.id === 'sale' || e.target.id === 'rent') {
            setFormData({
                ...formData,
                type: e.target.id
            })    
        }

        if(e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked
            })
        }

        if(e.target.type ==='number' || e.target.type === 'textarea' || e.target.type === 'text') {
            setFormData({
                ...formData,
                [e.target.id] : e.target.value
            })
        }        
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if(formData.imageUrls.length < 1) return setError("You must upload at least one")
            if(+formData.regularPrice < +formData.discountPrice) return setError("Discounted price must be less than regular price")             
            
            setLoading(true);
            setError(null);
            const res = await fetch('/api/listing/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    userRef: currentUser._id
                })
            });

            const data = await res.json();
            if(data.success === false) {
                setError(data.message);
                setLoading(false);
                return
            }
            setLoading(false);
            navigate(`/listing/${data._id}`)
        } catch(error) {
            setError(error.message);
            setLoading(false);
        }
    }

    return (
    <main className="p-3 max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-center my-7">Create a Listing</h1>
        <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 flex-1">
                <input type="text" placeholder="Name" className="border p-3 rounded-lg" id="name" 
                        maxLength='62' minLength='10' required onChange={handleChange} value={formData.name}/>

                <textarea type="text" placeholder="Description" className="border p-3 rounded-lg" 
                        id="description" required onChange={handleChange} value={formData.description}/>

                <input type="text" placeholder="Address" className="border p-3 rounded-lg" 
                    id="address" required onChange={handleChange} value={formData.address}/>           
            
                <div className="flex gap-6 flex-wrap">
                    <div className="flex gap-2">
                        <input type="checkbox" id="sale" className="w-5"
                            onChange={handleChange} checked={formData.type === 'sale'}/>
                        <span>Sell</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="checkbox" id="rent" className="w-5"
                            onChange={handleChange} checked={formData.type === 'rent'}/>
                        <span>Rent</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="checkbox" id="parking" className="w-5"
                            onChange={handleChange} checked={formData.parking}/>
                        <span>Parking Spot</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="checkbox" id="furnished" className="w-5"
                            onChange={handleChange} checked={formData.furnished}/>
                        <span>Furnished</span>
                    </div>
                    <div className="flex gap-2">
                        <input type="checkbox" id="offer" className="w-5"
                            onChange={handleChange} checked={formData.offer} />
                        <span>Offer</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-6">
                    <div className="flex items-center gap-2">
                        <input type="number" id="bedrooms" min="1" max="10" required
                        className="p-3 border border-gray-300 rounded-lg"
                        onChange={handleChange} value={formData.bedrooms}/>
                        <span>Beds</span>
                    </div> 
                    <div className="flex items-center gap-2">
                        <input type="number" id="bathrooms" min="1" max="10" required
                        className="p-3 border border-gray-300 rounded-lg"
                        onChange={handleChange} value={formData.bathrooms}/>
                        <span>Baths</span>
                    </div> 
                    <div className="flex items-center gap-2">
                        <input type="number" id="regularPrice"  required
                        className="p-3 border border-gray-300 rounded-lg"
                        min='50' max='1000000'
                        onChange={handleChange} value={formData.regularPrice}/>
                        <div className="flex flex-col items-center"> 
                            <p>Regular Price</p>
                            {formData.type === 'rent' ? (<span className="text-xs">($ / Month)</span>) : ''}
                        </div>
                        
                    </div>
                    {formData.offer && (<div className="flex items-center gap-2">
                        <input type="number" id="discountPrice"  required
                        className="p-3 border border-gray-300 rounded-lg"
                        min='0' max='1000000'
                        onChange={handleChange} value={formData.discountPrice}/>
                        <div className="flex flex-col items-center">
                            <p>Discounted Price</p>
                            {formData.type === 'rent' ? (<span className="text-xs">($ / Month)</span>) : ''}
                        </div>                    
                    </div> ) }              
                </div>
            </div>
            <div className="flex flex-col flex-1 gap-4">
                <p className='font-semibold'>Images:
                <span className="font-normal text-gray-600 ml-2">The first image will be the cover (max 6)</span>
                </p>
                <div className="flex gap-4">
                    <input onChange={(e)=>setFiles(e.target.files)}
                            className="p-3 border rounded w-full border-gray-300" 
                            type="file" id="images" accept="image/*" multiple />
                    <button type='button' disabled={uploading}
                            onClick={handleImageSubmit}
                            className='p-3 text-green-700 border border-green-700 uppercase
                                rounded hover:shadow-lg diasbled:opacity-80'>
                        {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                </div>
                <p className='text-red-700 text-sm'>{imageUploadError}</p> 
                {
                    formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => {
                        return (
                        <div key={url} className='flex justify-between p-3 border items-center'>
                        <img src={url} alt='listing image' className='w-40 h-40 object-cover rounded-lg' />
                        <button onClick={() => handleRemoveImage(index)} 
                                type='button' className='p-3 text-red-700 rounded-lg uppercase hover:opacity-75'>
                            Delete
                        </button>
                        </div>
                        )
                    })
                } 
                <button className="p-3 bg-slate-700 text-white rounded-lg uppercase 
                                hover:opacity-95 disabled:opacity-80">
                    {loading ? 'Creating ...' : 'Create Listing'}
                </button>
                {error && <p className='text-red-700 text-sm'>{error}</p>}
            </div>          
        </form>
    </main>
    )
    
}